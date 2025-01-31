import { useEffect, useState } from 'react';
import firebase from './firebaseConfig';  // Importa a configuração do Firebase

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(setUser);

    // Cleanup do efeito
    return () => unsubscribe();
  }, []);

  return user;
};
