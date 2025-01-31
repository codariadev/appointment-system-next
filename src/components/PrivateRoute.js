import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/useAuth';

const PrivateRoute = ({ children }) => {
  const user = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login'); // Redireciona para a página de login se não estiver autenticado
    }
  }, [user, router]);

  if (!user) {
    return <div>Loading...</div>; // Enquanto a autenticação não é verificada
  }

  return <>{children}</>; // Caso esteja autenticado, renderiza a página protegida
};

export default PrivateRoute;
