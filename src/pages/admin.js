import React, { useEffect, useState } from 'react';
import Layout from '@components/layout';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/router';

const Admin = () => {
  const {user, loading} = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if(!user){
        router.push('/home');
      }else if (user.nivel < 4) {
        alert('Acesso negado');
        router.push('/home');
      }else {
        setAuthorized(true);
      }
    }
  }, [user, loading, router]);

  if (loading) {

    const timer = setTimeout(() => 1000);
    const clearTime = clearTimeout(timer);

  return (
    <div className='w-full h-screen flex justify-center items-center'>
      <div
        className="w-32 aspect-square rounded-full relative flex justify-center items-center animate-[spin_3s_linear_infinite] z-40 bg-[conic-gradient(white_0deg,white_300deg,transparent_270deg,transparent_360deg)] before:animate-[spin_2s_linear_infinite] before:absolute before:w-[60%] before:aspect-square before:rounded-full before:z-[80] before:bg-[conic-gradient(white_0deg,white_270deg,transparent_180deg,transparent_360deg)] after:absolute after:w-3/4 after:aspect-square after:rounded-full after:z-[60] after:animate-[spin_3s_linear_infinite] after:bg-[conic-gradient(#1e40af_0deg,#1e40af_0deg,transparent_180deg,transparent_360deg)]"
      >
        <span
          className="absolute w-[85%] aspect-square rounded-full z-[60] animate-[spin_5s_linear_infinite] bg-[conic-gradient(#3b82f6_0deg,#3b82f6_0deg,transparent_180deg,transparent_360deg)]"
        >
        </span>
      </div>
    </div>

  )
}
if (!authorized) {
  return <div>Verificando permissão...</div>;
}

  return (
    <Layout>
      <div className="p-5 flex flex-col items-center w-full h-full rounded">
      <div className="text-center mb-6 bg-gray-100 p-8 rounded-lg shadow-lg w-full">
          <h1 className="text-2xl font-bold">Administração</h1>
      </div>
        
        <div className="w-full h-full flex items-center justify-center">
          <div className='grid grid-cols-2 gap-6'>
          <div className="w-64 bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <h2 className="mb-2 text-xl font-semibold">Funcionários</h2>
            <p className="mb-4 text-gray-600">Gerencie seus colaboradores.</p>
            <Link href="/admin/funcionarios" className="text-blue-600 font-bold hover:underline">Gerenciar Funcionários</Link>
          </div>

          <div className="w-64 bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <h2 className="mb-2 text-xl font-semibold">Estoque</h2>
            <p className="mb-4 text-gray-600">Controle de produtos e alertas de reposição.</p>
            <Link href="/admin/estoque" className="text-blue-600 font-bold hover:underline">Controle de Estoque</Link>
          </div>

          <div className="w-64 bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <h2 className="mb-2 text-xl font-semibold">Relatórios</h2>
            <p className="mb-4 text-gray-600">Acompanhe o desempenho e o faturamento.</p>
            <Link href="/admin/relatorios" className="text-blue-600 font-bold hover:underline">Ver Relatórios</Link>
          </div>

          <div className="w-64 bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <h2 className="mb-2 text-xl font-semibold">Clientes VIP</h2>
            <p className="mb-4 text-gray-600">Gerencie os clientes mais importantes.</p>
            <Link href="#" className="text-blue-600 font-bold hover:underline">Clientes VIP</Link>
          </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
