'use client'
import React, { useState } from 'react';
import Select from 'react-select';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from '@/lib/firebaseConfig';

const LoginRegisterModal = ({ isOpen, closeModal }) => {
  if (!isOpen) return null;

  const db = getFirestore(app);
  const auth = getAuth(app);

  const emp = [
    { value: 'barber', label: 'Barbearia' },
    { value: 'saloon', label: 'Salão de Beleza' }
  ];

  const [empresa, setEmpresa] = useState("BarberSC");
  const [cnpj, setCnpj] = useState("122322323123412");
  const [ramo, setRamo] = useState("");
  const [nome, setNome] = useState("Lucas Eduardo");
  const [usuario, setUsuario] = useState("lucasalves");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const nivel = ""; // Deixar em branco como solicitado

  const formatCNPJ = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);
  };

  const handleCNPJChange = (e) => setCnpj(formatCNPJ(e.target.value));

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Criar usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // Criar documento no Firestore com as custom claims
      await setDoc(doc(db, 'users', user.uid), {
        nome,
        usuario,
        empresa,
        cnpj,
        ramo,
        nivel, // Nível fica em branco como solicitado
        email, // Apenas para referência
      });

      alert('Usuário cadastrado com sucesso!');
      closeModal();
    } catch (error) {
      console.error("Erro ao registrar:", error);
      alert("Erro ao cadastrar usuário: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Cadastro</h2>
        <form onSubmit={handleRegister}>
          <div className='flex flex-row gap-5 py-5'>
            <div className='flex flex-col h-full justify-between'>
              <h2 className='text-center font-bold py-4'>Login</h2>
              <label>Nome:</label>
              <input 
                type="text" 
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"  
                required 
                value={nome} 
                onChange={(e) => setNome(e.target.value)}
              />
              <label>Usuário:</label>
              <input 
                type="text" 
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"  
                required 
                value={usuario} 
                onChange={(e) => setUsuario(e.target.value)}
              />
              <label>Email:</label>
              <input 
                type="email" 
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"  
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>Senha:</label>
              <input 
                type="password" 
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"  
                required 
                value={senha} 
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
            <div className='flex flex-col h-full justify-between'>
              <h2 className='text-center font-bold py-4'>Empresa</h2>
              <label>Nome da empresa:</label>
              <input
                type="text" 
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"  
                required 
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
              />
              <label>CNPJ da empresa:</label>
              <input 
                type="text" 
                value={cnpj}
                onChange={handleCNPJChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="00.000.000/0000-00"
                required 
              />
              <label>Ramo da empresa:</label>
              <Select
                className="mt-1 block w-full text-lg"  
                options={emp}
                value={emp.find(option => option.value === ramo)}
                onChange={(selectedOption) => setRamo(selectedOption.value)}
                isClearable
                placeholder="Selecione"
                noOptionsMessage={() => 'Nenhum cliente encontrado'}
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-500 text-white p-2 rounded-md"
            disabled={loading}
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
        <button 
          onClick={closeModal} 
          className="w-full bg-red-500 text-white p-2 rounded-md mt-4"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default LoginRegisterModal;
