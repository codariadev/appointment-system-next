import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc, getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Função para configurar a persistência ao logar
export const setUserPersistence = async () => {
  const auth = getAuth();
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log("Persistência definida corretamente");
  } catch (error) {
    console.error("Erro ao definir persistência:", error);
  }
};

// Função para obter o nome da empresa vinculada ao usuário
const getCompanyName = async () => {
  
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    const router = useRouter();
    alert("Usuário não autenticado.");
    router.push('/login');
    return;
  }

  try {
    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      return docSnap.data().empresa;
    } else {
      console.error("Usuário não encontrado.");
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar dados da empresa:", error);
    throw error;
  }
};

export const AuthenticationHandler = () => {
  const auth = getAuth();

  useEffect(() => {
    const checkAuthStatus = async (user) => {
      if (!user) {
        const router = useRouter();
        alert("Usuário não autenticado.");
        router.push('/login');
      } else {
        await setUserPersistence();
      }
    };

    const unsubscribe = onAuthStateChanged(auth, checkAuthStatus);

    // Cleanup do efeito
    return () => unsubscribe();
  }, [auth]);

  return null; // Esse componente não precisa renderizar nada
};

// Função para verificar se o usuário está logado antes de continuar
const checkAuthAndRun = async (operation) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    const router = useRouter();
    alert("Usuário não autenticado.");
    router.push('/login');
    return;
  }

  console.log("Usuário autenticado. Executando operação...");
  await operation();
};

const getCompanyCollectionPath = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    const router = useRouter();
    alert("Usuário não autenticado.");
    router.push('/login');
  }

  const companyName = await getCompanyName();
  if (companyName) {
    return `companies/${companyName}`;
  }
  return null;
};

// Funções para Clientes
const getClientsCollectionPath = async () => {
  const companyCollectionPath = await getCompanyCollectionPath();
  if (!companyCollectionPath) throw new Error('Usuário não autenticado.');

  // Garantindo que a estrutura seja "companies/{companyName}/appointments"
  const collectionPath = `${companyCollectionPath}/clients`; // Correto: coleções seguidas de documentos
  return collectionPath;
};


export const fetchClients = async () => {
  const clientsCollectionPath = await getClientsCollectionPath();
  if (!clientsCollectionPath) throw new Error('Usuário não autenticado.');

  const clientsCollection = collection(db, clientsCollectionPath);
  const snapshot = await getDocs(clientsCollection);
  const clientsList = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return clientsList;
};

export const addClient = async (client) => {
  checkAuthAndRun(async () => {
    try {
      const companyCollectionPath = await getClientsCollectionPath();
      if (!companyCollectionPath) throw new Error('Usuário não autenticado.');

      const clientsCollection = collection(db, companyCollectionPath);
      const docRef = await addDoc(clientsCollection, client);
      console.log('Cliente adicionado com ID: ', docRef.id);
    } catch (e) {
      console.error('Erro ao adicionar cliente: ', e);
    }
  });
};

export const updateClient = async (id, updatedClient) => {
  checkAuthAndRun(async () => {
    try {
      const companyCollectionPath = await getCompanyCollectionPath();
      if (!companyCollectionPath) throw new Error('Usuário não autenticado.');

      const clientDoc = doc(db, companyCollectionPath, id);
      await updateDoc(clientDoc, updatedClient);
      console.log('Cliente atualizado com ID: ', id);
    } catch (e) {
      console.error('Erro ao atualizar cliente: ', e);
    }
  });
};

export const deleteClient = async (id) => {
  checkAuthAndRun(async () => {
    try {
      const companyCollectionPath = await getCompanyCollectionPath();
      if (!companyCollectionPath) throw new Error('Usuário não autenticado.');

      const clientDoc = doc(db, companyCollectionPath, id);
      await deleteDoc(clientDoc);
      console.log('Cliente excluído com ID: ', id);
    } catch (e) {
      console.error('Erro ao excluir cliente: ', e);
    }
  });
};

// Funções de Agendamentos
const getAppointmentsCollectionPath = async () => {
  const companyCollectionPath = await getCompanyCollectionPath();
  if (!companyCollectionPath) throw new Error('Usuário não autenticado.');

  // Garantindo que a estrutura seja "companies/{companyName}/appointments"
  const collectionPath = `${companyCollectionPath}/appointments`; // Correto: coleções seguidas de documentos
  return collectionPath;
};

export const saveAppointment = async (appointment, id = null) => {
  checkAuthAndRun(async () => {
    try {
      const appointmentsCollection = collection(db, await getAppointmentsCollectionPath());
      if (id) {
        const docRef = doc(appointmentsCollection, id);
        await updateDoc(docRef, appointment);
      } else {
        const docRef = await addDoc(appointmentsCollection, appointment);
        return docRef.id;
      }
    } catch (error) {
      console.error('Erro ao salvar o agendamento', error);
      throw error;
    }
  });
};

export const deleteAppointment = async (id) => {
  checkAuthAndRun(async () => {
    try {
      const companyCollectionPath = await getAppointmentsCollectionPath();
      if (!companyCollectionPath) {
        console.error('Caminho da coleção de agendamentos não encontrado.');
        return;
      }

      const appointmentRef = doc(db, companyCollectionPath, id); // Verifique o caminho aqui
      await deleteDoc(appointmentRef);
      console.log('Agendamento deletado com sucesso');
    } catch (error) {
      console.error('Erro ao deletar o agendamento:', error);
    }
  });
};


export const fetchAppointments = async () => {
  const appointmentsCollectionPath = await getAppointmentsCollectionPath();
  if (!appointmentsCollectionPath) throw new Error('Usuário não autenticado.');

  const appointmentsCollection = collection(db, appointmentsCollectionPath);
  const snapshot = await getDocs(appointmentsCollection);
  const appointmentList = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return appointmentList;
};



// Funções de Produtos e Serviços
const getProductsCollectionPath = async () => {
  const companyCollectionPath = await getCompanyCollectionPath();
  
  if (!companyCollectionPath) throw new Error('Usuário não autenticado.');
  return `${companyCollectionPath}/products`;
};


export const fetchProducts = async () => {
  const productsCollectionPath = await getProductsCollectionPath();
  if (!productsCollectionPath) throw new Error('Usuário não autenticado.');

  const snapshot = await getDocs(collection(db, productsCollectionPath));
      const products = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  return products;
};



export const addProduct = async (product) => {
  checkAuthAndRun(async () => {
    try {
      const companyCollectionPath = await getProductsCollectionPath();

      const productsCollection = collection(db, companyCollectionPath);
      const docRef = await addDoc(productsCollection, product);
      console.log(docRef);
      
    } catch (e) {
      console.error('Erro ao adicionar o produto: ', e);
    }
  });
};

export const updateProduct = async (id, updatedProduct) => {
  checkAuthAndRun(async () => {
    await updateDoc(doc(db, await getProductsCollectionPath(), id), updatedProduct);
  });
};

export const deleteProduct = async (id) => {
  checkAuthAndRun(async () => {
    try {
      const productRef = doc(db, await getProductsCollectionPath(), id);
      await deleteDoc(productRef);
      console.log(`Produto com ID ${id} foi excluído com sucesso.`);
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      throw error;
    }
  });
};

// Funções de Funcionários
const getEmployeesCollectionPath = async () => {
  const companyCollectionPath = await getCompanyCollectionPath();
  if (!companyCollectionPath) throw new Error('Usuário não autenticado.');
  return `${companyCollectionPath}/employees`;
};

export const fetchEmployees = async () => {
  checkAuthAndRun(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, await getEmployeesCollectionPath()));
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      throw error;
    }
  });
};

export const addEmployee = async (employeeData) => {
  checkAuthAndRun(async () => {
    try {
      const docRef = await addDoc(collection(db, await getEmployeesCollectionPath()), employeeData);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar funcionário:', error);
      throw error;
    }
  });
};

export const updateEmployee = async (id, employeeData) => {
  checkAuthAndRun(async () => {
    try {
      const employeeRef = doc(db, await getEmployeesCollectionPath(), id);
      await updateDoc(employeeRef, employeeData);
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
      throw error;
    }
  });
};

export const deleteEmployee = async (id) => {
  checkAuthAndRun(async () => {
    try {
      const employeeRef = doc(db, await getEmployeesCollectionPath(), id);
      await deleteDoc(employeeRef);
    } catch (error) {
      console.error('Erro ao deletar funcionário:', error);
      throw error;
    }
  });
};

// Funções de Vendas
const getSalesCollectionPath = async () => {
  const companyCollectionPath = await getCompanyCollectionPath();
  if (!companyCollectionPath) throw new Error('Usuário não autenticado.');
  return `${companyCollectionPath}/sales`;
};

export const saveSales = async (sale) => {
  checkAuthAndRun(async () => {
    try {
      const docRef = await addDoc(collection(db, await getSalesCollectionPath()), sale);
      console.log('Venda salva com ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.log('Erro ao salvar venda:', error);
      throw error;
    }
  });
};

export const fetchSales = async () => {
  checkAuthAndRun(async () => {
    const snapshot = await getDocs(collection(db, await getSalesCollectionPath()));
    const sales = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const totalSales = sales.reduce((total, sale) => total + sale.total, 0);
    return { sales, totalSales };
  });
};
