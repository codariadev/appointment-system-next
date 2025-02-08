import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc, getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { useEffect } from 'react';


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
    alert("Usuário não autenticado.");
    window.location.href = "/login";
    return null;
  }

  try {
    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      return docSnap.data().empresa;
    } else {
      alert("Usuário não encontrado.");
      window.location.href = "/login";
      return null;
    }
  } catch (error) {
    alert("Erro ao buscar dados da empresa.");
    console.error(error);
    return null;
  }
};

export const AuthenticationHandler = () => {
  const auth = getAuth();

  useEffect(() => {
    const checkAuthStatus = async (user) => {
      if (!user) {
        alert("Usuário não autenticado.");
        window.location.href = "/login";
      } else {
        await setUserPersistence();
      }
    };

    const unsubscribe = onAuthStateChanged(auth, checkAuthStatus);

    return () => unsubscribe();
  }, [auth, router]);

  return null;
};

// Função para verificar se o usuário está logado antes de continuar
const checkAuthAndRun = async (operation) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    alert("Usuário não autenticado.");
    window.location.href = "/login";
    return null;
  }

  console.log("Usuário autenticado. Executando operação...");
  await operation();
};

const getCompanyCollectionPath = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    alert("Usuário não autenticado.");
    window.location.href = "/login";
    return null;
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
  if (!companyCollectionPath) {
    alert("Usuário não autenticado.");
    window.location.href = "/login";
    return null;
  }

  const collectionPath = `${companyCollectionPath}/clients`;
  return collectionPath;
};

export const fetchClients = async () => {
  const clientsCollectionPath = await getClientsCollectionPath();
  if (!clientsCollectionPath) {
    alert("Usuário não autenticado.");
    window.location.href = "/login";
    return [];
  }

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
      if (!companyCollectionPath) {
        alert("Usuário não autenticado.");
        window.location.href = "/login";
        return;
      }

      const clientsCollection = collection(db, companyCollectionPath);
      const docRef = await addDoc(clientsCollection, client);
      console.log('Cliente adicionado com ID: ', docRef.id);
    } catch (e) {
      alert("Erro ao adicionar cliente.");
      window.location.href = "/login";
      console.error(e);
    }
  });
};

export const updateClient = async (id, updatedClient) => {
  checkAuthAndRun(async () => {
    try {
      const companyCollectionPath = await getCompanyCollectionPath();
      if (!companyCollectionPath) {
        alert("Usuário não autenticado.");
        window.location.href = "/login";
        return;
      }

      const clientDoc = doc(db, companyCollectionPath, id);
      await updateDoc(clientDoc, updatedClient);
      console.log('Cliente atualizado com ID: ', id);
    } catch (e) {
      alert("Erro ao atualizar cliente.");
      console.error(e);
    }
  });
};

export const deleteClient = async (id) => {
  checkAuthAndRun(async () => {
    try {
      const companyCollectionPath = await getCompanyCollectionPath();
      if (!companyCollectionPath) {
        alert("Usuário não autenticado.");
        window.location.href = "/login";
        return;
      }

      const clientDoc = doc(db, companyCollectionPath, id);
      await deleteDoc(clientDoc);
      console.log('Cliente excluído com ID: ', id);
    } catch (e) {
      alert("Erro ao excluir cliente.");
      console.error(e);
    }
  });
};

// Funções de Agendamentos
const getAppointmentsCollectionPath = async () => {
  const companyCollectionPath = await getCompanyCollectionPath();
  if (!companyCollectionPath) {
    alert("Usuário não autenticado.");
    window.location.href = "/login";
    return null;
  }

  const collectionPath = `${companyCollectionPath}/appointments`;
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
      alert("Erro ao salvar o agendamento.");
      console.error(error);
    }
  });
};

export const deleteAppointment = async (id) => {
  checkAuthAndRun(async () => {
    try {
      const companyCollectionPath = await getAppointmentsCollectionPath();
      if (!companyCollectionPath) {
        alert("Caminho da coleção de agendamentos não encontrado.");
        return;
      }

      const appointmentRef = doc(db, companyCollectionPath, id);
      await deleteDoc(appointmentRef);
      console.log('Agendamento deletado com sucesso');
    } catch (error) {
      alert("Erro ao deletar o agendamento.");
      console.error(error);
    }
  });
};

export const fetchAppointments = async () => {
  const appointmentsCollectionPath = await getAppointmentsCollectionPath();
  if (!appointmentsCollectionPath) {
    alert("Usuário não autenticado.");
    window.location.href = "/login";
    return [];
  }

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
  if (!companyCollectionPath) {
    alert("Usuário não autenticado.");
    window.location.href = "/login";
    return null;
  }
  return `${companyCollectionPath}/products`;
};

export const fetchProducts = async () => {
  const productsCollectionPath = await getProductsCollectionPath();
  if (!productsCollectionPath) {
    alert("Usuário não autenticado.");
    window.location.href = "/login";
    return [];
  }

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
      alert("Erro ao adicionar o produto.");
      console.error(e);
    }
  });
};

export const updateProduct = async (id, updatedProduct) => {
  checkAuthAndRun(async () => {
    try {
      await updateDoc(doc(db, await getProductsCollectionPath(), id), updatedProduct);
    } catch (error) {
      alert("Erro ao atualizar o produto.");
      console.error(error);
    }
  });
};

export const deleteProduct = async (id) => {
  checkAuthAndRun(async () => {
    try {
      const productRef = doc(db, await getProductsCollectionPath(), id);
      await deleteDoc(productRef);
      console.log(`Produto com ID ${id} foi excluído com sucesso.`);
    } catch (error) {
      alert("Erro ao excluir produto.");
      console.error(error);
    }
  });
};

// Funções de Funcionários
const getEmployeesCollectionPath = async () => {
  const companyCollectionPath = await getCompanyCollectionPath();
  if (!companyCollectionPath) {
    alert("Usuário não autenticado.");
    window.location.href = "/login";
    return null;
  }
  return `${companyCollectionPath}/employees`;
};



export const fetchEmployees = async () => {
  const employeesCollectionPath = await getEmployeesCollectionPath();
  if (!employeesCollectionPath) {
    alert("Usuário não autenticado.");
    window.location.href = "/login";
    return [];
  }

  const getEmployeesCollection = collection(db, employeesCollectionPath);
  const snapshot = await getDocs(getEmployeesCollection);
  const employeesList = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return employeesList;
};

export const addEmployee = async (employeeData) => {
  checkAuthAndRun(async () => {
    try {
      const docRef = await addDoc(collection(db, await getEmployeesCollectionPath()), employeeData);
      return docRef.id;
    } catch (error) {
      alert("Erro ao adicionar funcionário.");
      console.error(error);
      return null;
    }
  });
};

export const updateEmployee = async (id, employeeData) => {
  checkAuthAndRun(async () => {
    try {
      const employeeRef = doc(db, await getEmployeesCollectionPath(), id);
      await updateDoc(employeeRef, employeeData);
    } catch (error) {
      alert("Erro ao atualizar funcionário.");
      console.error(error);
    }
  });
};

export const deleteEmployee = async (id) => {
  checkAuthAndRun(async () => {
    try {
      const employeeRef = doc(db, await getEmployeesCollectionPath(), id);
      await deleteDoc(employeeRef);
    } catch (error) {
      alert("Erro ao deletar funcionário.");
      console.error(error);
    }
  });
};

// Funções de Vendas
const getSalesCollectionPath = async () => {
  const companyCollectionPath = await getCompanyCollectionPath();
  if (!companyCollectionPath) {
    alert("Usuário não autenticado.");
    window.location.href = "/login";
    return null;
  }
  return `${companyCollectionPath}/sales`;
};

export const saveSales = async (sale) => {
  checkAuthAndRun(async () => {
    try {
      const docRef = await addDoc(collection(db, await getSalesCollectionPath()), sale);
      console.log('Venda salva com ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      alert("Erro ao salvar venda.");
      console.error(error);
      return null;
    }
  });
};

export const fetchSales = async () => {
  try {
    const companyCollectionPath = await getCompanyCollectionPath();
    if (!companyCollectionPath) {
      alert("Usuário não autenticado.");
      window.location.href = "/login";
      return { sales: [], totalSales: 0 };
    }

    const salesCollectionPath = `${companyCollectionPath}/sales`;
    const salesCollection = collection(db, salesCollectionPath);
    const snapshot = await getDocs(salesCollection);

    if (snapshot.empty) {
      console.log("Nenhuma venda encontrada.");
      return { sales: [], totalSales: 0 };
    }

    const sales = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const totalSales = sales.reduce((total, sale) => total + (sale.total || 0), 0);

    return { sales, totalSales };
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    alert("Erro ao buscar vendas.");
    return { sales: [], totalSales: 0 };
  }
};


//Funções de estoque
export const consumeProductStock = async (productId, quantity) => {
  const companyCollectionPath = await getCompanyCollectionPath();
  if (!companyCollectionPath) {
    alert("Usuário não autenticado.");
    window.location.href = "/login";
    return;
  }

  try {
    const productDocRef = doc(db, `${companyCollectionPath}/products`, productId);
    const productDoc = await getDoc(productDocRef);

    if (productDoc.exists()) {
      const productData = productDoc.data();
      const updatedStock = productData.estoque - quantity; // Subtrai a quantidade do estoque

      if (updatedStock < 0) {
        alert("Estoque insuficiente para realizar a venda.");
        return;
      }

      await updateDoc(productDocRef, { estoque: updatedStock });
      console.log(`Estoque do produto ${productData.name} atualizado. Novo estoque: ${updatedStock}`);
    } else {
      alert("Produto não encontrado.");
    }
  } catch (error) {
    alert("Erro ao consumir o estoque.");
    console.error(error);
  }
};
