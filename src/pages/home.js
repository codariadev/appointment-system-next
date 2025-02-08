"use client";
import React, { useEffect, useState } from 'react';
import { fetchAppointments, fetchClients } from '@/lib/firestoreFunction';  // Certifique-se de que esses métodos existem
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import Layout from '@/components/layout';
import { useAuth } from '@/lib/useAuth';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [userName, setUserName] = useState("");
  
  const { user, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.nivel < 1) {
        alert("Acesso Negado");
        router.push('/login');
      } else {
        setAuthorized(true);
        setUserName(user.nome);
      }
    }
  }, [user, loading, router]);

  // Função para buscar os agendamentos e clientes
  useEffect(() => {
    const loadData = async () => {
      try {
        const fetchedAppointments = await fetchAppointments();  // Supondo que fetchAppointments retorne os agendamentos
        const fetchedClients = await fetchClients();  // Supondo que fetchClients retorne os clientes
        // Verifique se os dados são arrays
        setEvents(fetchedAppointments || []);
        setClients(fetchedClients || []);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };
  
    if (authorized) {                                                                     
        loadData();
      }
  }, [authorized]); // O timer deve ser reiniciado sempre que 'authorized' mudar
  

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

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <Layout>
      <div className="p-5 bg-gray-100 w-full mx-auto h-screen text-black">
        <header className="bg-blue-500 text-white p-5 rounded-lg text-center">
          <h1 className="text-2xl font-bold">Bem-vindo (a), {userName}!</h1>
          <p>Hoje é {new Date().toLocaleDateString('pt-BR')}</p>
        </header>

        <section className="flex gap-5 mt-8">
          <div className="flex-1 bg-white p-5 rounded-lg shadow-md text-center">
            <h2 className="text-blue-500 text-xl">Agendamentos</h2>
            <p>{events?.length || 0} agendamentos!</p>
            <button onClick={() => handleNavigation('/appointments')} className="mt-3 px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">
              Ver todos
            </button>
          </div>
          <div className="flex-1 bg-white p-5 rounded-lg shadow-md text-center">
            <h2 className="text-blue-500 text-xl">Clientes</h2>
            <p>Você tem {clients?.length || 0} clientes cadastrados</p>
            <button onClick={() => handleNavigation('/costumers')} className="mt-3 px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">
              Gerenciar
            </button>
          </div>
        </section>

        <section className="mt-12 w-full ">
          <h2 className="text-xl text-center mb-5">Próximos Agendamentos</h2>
          <div className="bg-white rounded-lg shadow-md h-full flex justify-center">
            {events.length === 0 ? (
              <p>Sem agendamentos</p>
            ) : (
              <div className='w-full p-5'>
                {events
                  .filter((event) => new Date(event.start) >= new Date())
                  .sort((a, b) => new Date(a.start) - new Date(b.start))
                  .map((event) => (
                    <div key={event.id} className="bg-gray-200 p-2 rounded-md shadow-sm flex justify-between">
                      <p>Cliente: <strong>{event.costumer}</strong></p>
                      <p className="text-center">{format(new Date(event.start), 'dd/MM/yyyy')}</p>
                      <p className="text-right">{format(new Date(event.start), 'HH:mm')} até {format(new Date(event.end), 'HH:mm')}</p>
                    </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
