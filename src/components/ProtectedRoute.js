import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebaseConfig"; // Ajuste o caminho conforme sua estrutura
import { onAuthStateChanged } from "firebase/auth";

const ProtectedRoute = (WrappedComponent) => {
  return function WithAuth(props) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          router.push("/login"); // Redireciona para login se não estiver autenticado
        } else {
          setUser(user);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }, [router]);

    if (loading) return <p>Carregando...</p>;

    return user ? <WrappedComponent {...props} /> : null;
  };
};

export default ProtectedRoute;
