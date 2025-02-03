import PrivateRoute from '../components/ProtectedRoute';

const ProtectedPage = () => {
  return (
    <PrivateRoute>
      <h1>Bem-vindo à Página Protegida</h1>
      <p>Conteúdo exclusivo para usuários autenticados.</p>
    </PrivateRoute>
  );
};

export default ProtectedPage;
