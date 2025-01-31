import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/useAuth';  // Importe o hook que verifica a autenticação

const Home = () => {
  const user = useAuth(); // Verifica se o usuário está autenticado
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');  // Redireciona para o login se o usuário não estiver autenticado
    }
  }, [user, router]);

  if (!user) {
    return <div>Carregando...</div>; // Enquanto o estado de autenticação é verificado
  }

  return (
    <div>
      <h1>Bem-vindo ao Sistema de Agendamento</h1>
      <p>Conteúdo exclusivo para usuários autenticados.</p>
    </div>
  );
};

export default Home;
