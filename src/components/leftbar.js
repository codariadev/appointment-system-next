import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

const LeftBar = () => {
  const [activeItem, setActiveItem] = useState('');
  const router = useRouter();
  const auth = getAuth();
  const { user } = useAuth();

  const handleActiveItem = (item) => {
    setActiveItem(item);
  };

  const handleNavigation = (path) => {
    router.push(path);
    handleActiveItem(path);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logout Realizado com sucesso");  // Desconecta o usuário
      router.push('/login');  // Redireciona para a página de login após logout
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };


  useEffect(() => {
    function adjustFontSize() {
      const width = window.innerWidth;
      const fontSize = Math.max(12, width / 100) + 'px';
      document.querySelector('.leftbar').style.fontSize = fontSize;
    }
    window.addEventListener('load', adjustFontSize);
    window.addEventListener('resize', adjustFontSize);

    return () => {
      window.removeEventListener('load', adjustFontSize);
      window.removeEventListener('resize', adjustFontSize);
    };
  }, []);

  return (
    <div className="leftbar w-[15%] bg-[#1e1e2f] text-white h-screen fixed flex flex-col justify-between">
      <div>
        <div className="logo py-5 text-center bg-[#28293e] font-bold w-full">
          <h2>{user?.empresa}</h2>
        </div>
        <nav className="menu">
          <ul className="list-none p-1">
            <li className="menu-item">
              <span
                className={`block py-4 px-0 text-center cursor-pointer rounded transition-all duration-300 ${activeItem === '/' ? 'bg-[#333351] shadow-md' : ''}`}
                onClick={() => handleNavigation('/home')}
              >
                Página Inicial
              </span>
            </li>

            <li className="menu-item">
              <span
                className={`block py-4 px-0 text-center cursor-pointer rounded transition-all duration-300 ${activeItem === '/appointments' ? 'bg-[#333351] shadow-md' : ''}`}
                onClick={() => handleNavigation('/appointments')}
              >
                Agendamentos
              </span>
            </li>

            <li className="menu-item">
              <span
                className={`block py-4 px-0 text-center cursor-pointer rounded transition-all duration-300 ${activeItem === '/costumers' ? 'bg-[#333351] shadow-md' : ''}`}
                onClick={() => handleNavigation('/clients')}
              >
                Clientes
              </span>
            </li>

            <li className="menu-item">
              <span
                className={`block py-4 px-0 text-center cursor-pointer rounded transition-all duration-300 ${activeItem === '/cash' ? 'bg-[#333351] shadow-md' : ''}`}
                onClick={() => handleNavigation('/payment')}
              >
                Caixa e Pagamentos
              </span>
            </li>

            {user?.nivel > 3 && (
              <li className="menu-item">
              <span
                className={`block py-4 px-0 text-center cursor-pointer rounded transition-all duration-300 ${activeItem === '/admin' ? 'bg-[#333351] shadow-md' : ''}`}
                onClick={() => handleNavigation('/admin')}
              >
                Administração
              </span>
            </li>
            )}

            <li className="menu-item">
              <span
                className={`block py-4 px-0 text-center cursor-pointer rounded transition-all duration-300 text-red-500 ${activeItem === '/settings' ? 'bg-[#333351] shadow-md' : ''}`}
                onClick={() => handleNavigation('/settings')}
              >
                Configurações
              </span>
            </li>

            {user?.nivel > 6 && (
              <li className="menu-item">
              <span
                className={`block py-4 px-0 text-center cursor-pointer rounded transition-all duration-300 text-red-500 ${activeItem === '/settings' ? 'bg-[#333351] shadow-md' : ''}`}
                onClick={() => handleNavigation('/dev')}
              >
                Dev
              </span>
            </li>
            )}
          </ul>
        </nav>
        <div className="logout">
          <ul className="list-none p-1">
            <li className="menu-item">
              <span
                className="block py-4 text-center cursor-pointer rounded transition-all duration-300 text-red-300"
                onClick={handleLogout} // Chama a função de logout
              >
                Sair
              </span>
            </li>
          </ul>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default LeftBar;
