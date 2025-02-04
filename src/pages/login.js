'use client'
import { useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@lib/firebaseConfig';
import LoginRegisterModal from '@modal/loginRegister';
import { setUserPersistence } from '@/lib/firestoreFunction';


const LoginPage = () => {

  const auth = getAuth(app);
  const db = getFirestore(app);
  const router = useRouter();

  const [inputEmail, setInputEmail] = useState('alves2@system.com');
  const [inputPassword, setInputPassword] = useState('123123');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  

  
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Define a persistência do Firebase para local
      setUserPersistence();

      // Autentica o usuário
      const userCredential = await signInWithEmailAndPassword(auth, inputEmail, inputPassword);
      const user = userCredential.user;

      // Obtém os dados do usuário no Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log(`✅ Login bem-sucedido!`);
        if (userData.empresa === "Dev"){
          console.log("Logado como dev");
          
        }
        console.log(`Nome: ${userData.nome}, Empresa: ${userData.empresa}, Nivel ${userData.nivel}`);
        router.push("/home");
      } else {
        console.log("⚠️ Erro: Usuário não encontrado no banco de dados.");
      }

    } catch (error) {
      console.error("❌ Erro ao fazer login:", error.message);
      alert('Credenciais incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="text" 
              id="login" 
              name="login" 
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md" 
              value={inputEmail} 
              onChange={(e) => setInputEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input 
              type="password" 
              id="senha" 
              name="senha" 
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md" 
              value={inputPassword} 
              onChange={(e) => setInputPassword(e.target.value)} 
              required 
            />
          </div>
          <div className='flex flex-col items-center w-full gap-4'>
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md" disabled={loading}>
              {loading ? "Verificando..." : "Entrar"}
            </button>
            <button type="button" onClick={openModal} className="w-1/3 bg-green-500 text-white p-1 rounded-md">Cadastrar</button>
          </div>
        </form>
      </div>
      
      {/* Modal */}
      <LoginRegisterModal isOpen={isModalOpen} closeModal={closeModal} />
    </div>
  );
};

export default LoginPage;
