// pages/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/useAuth'; // Ajuste o caminho conforme necessário

export default function IndexPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Se o usuário não estiver autenticado, redirecione para a página de login
        router.push('/login');
      } else {
        // Se o usuário estiver autenticado, redirecione para a página inicial (home)
        router.push('/home');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <p>Carregando...</p>; // Exibe um loader enquanto verifica a autenticação
  }

  return null; // Não renderiza nada, pois o redirecionamento será feito
}