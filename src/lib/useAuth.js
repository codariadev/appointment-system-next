import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebaseConfig"; // Ajuste conforme seu projeto
import { doc, getDoc } from "firebase/firestore";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        const userRef = doc(db, "users", authUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser({ uid: authUser.uid, email: authUser.email, nivel: userSnap.data().nivel, nome: userSnap.data().nome, empresa: userSnap.data().empresa });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};



