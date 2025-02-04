'use client'
import { useState, useEffect } from 'react';
import { deleteAppointment, fetchAppointments, fetchEmployees, fetchProducts, saveSales } from '@lib/firestoreFunction';
import Layout from '@components/layout';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/useAuth';

const Payment = () => {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [Employee, setEmployee] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
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
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadClients = async () => {
      const clientList = await fetchAppointments();
      const appointmentClients = clientList.map(appointment => ({
        id: appointment.id,
        name: appointment.costumer,
        cpf: appointment.cpf,
        service: appointment.service || [],
      }));
      setClients(appointmentClients);
    };

    const loadProducts = async () => {
      const productList = await fetchProducts();
      setProducts(productList);
    };

    loadClients();
    loadProducts();
  }, []);

  const loadEmployees = async () => {
    try {
      const employees = await fetchEmployees();
      const filteredEmployee = (employees || []).filter(employee => employee.cargo === 'Barbeiro').map(employee => employee.nome);
      setEmployee(filteredEmployee);
    } catch (error) {
      console.error('Erro ao carregar barbeiros:', error);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const addToCart = (service) => {
    if (service && service.price !== undefined && service.name) {
      setCart(prevCart => {
        const updatedCart = [...prevCart, service];
        const updatedTotal = updatedCart.reduce((total, item) => total + item.price, 0);
        setTotal(updatedTotal);
        return updatedCart;
      });
    }
  };

  const deleteCart = (index) => {
    const updateCart = cart.filter((_, i) => i !== index);
    setCart(updateCart);
    const newTotal = updateCart.reduce((total, item) => total + item.price, 0);
    setTotal(newTotal);
  };

  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = products.filter(product => product.name.toLowerCase().includes(term));
    setFilteredProducts(filtered);
    setHighlightIndex(0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredProducts.length > 0) {
      addToCart(filteredProducts[highlightIndex]);
    } else if (e.key === 'ArrowDown') {
      setHighlightIndex((prev) => (prev + 1) % filteredProducts.length);
    } else if (e.key === 'ArrowUp') {
      setHighlightIndex((prev) => (prev === 0 ? filteredProducts.length - 1 : prev - 1));
    }
  };

  const handleClientSelection = (clientId) => {
    if (clientId === "avulso") {
      setSelectedClient({
        id: 'avulso',
        name: 'Cliente Avulso',
        cpf: '',
        service: [],
      });
      setCart([]);
      setTotal(0);
    } else {
      const appointment = clients.find(client => client.id === clientId);
      setSelectedClient(appointment);

      if (appointment) {
        let clientServices = [];
        if (Array.isArray(appointment.service)) {
          clientServices = appointment.service.map(s => ({
            name: s.name,
            price: s.price
          }));
        } else if (appointment.service) {
          clientServices = [{
            name: appointment.service.name,
            price: appointment.service.price
          }];
        }
        const updatedTotal = clientServices.reduce((total, item) => total + item.price, 0);
        setTotal(updatedTotal);
        setCart(clientServices);
      } else {
        setCart([]);
      }
    }
  };

  const handleSale = async () => {
    const localDate = new Date();
    const formattedDate = format(localDate, 'dd/MM/yyyy', { locale: ptBR });
    const formmatedTime = format(localDate, 'HH:mm:ss');

    if (!selectedClient) {
      alert('Por favor, selecione um cliente antes de finalizar a venda.');
      return;
    }

    const saleData = {
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      clientCpf: selectedClient.cpf,
      employee: selectedEmployee,
      total: total,
      items: cart,
      date: {
        data: formattedDate,
        hora: formmatedTime,
      },
    };

    try {
      await saveSales(saleData);
      alert('Venda finalizada com sucesso!');
      await deleteAppointment(selectedClient.id);
      const updateClients = clients.filter(client => client.id !== selectedClient.id);
      setClients(updateClients);
      setCart([]);
      setTotal(0);
      setSelectedEmployee(null);
      setSelectedClient(null);
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
    }
  };

  const formatCpfNumber = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
  };

  if (loading) {
    const timer = setTimeout(() => 1000);
    const clearTime = clearTimeout(timer);

    return (
      <div className='w-full h-screen flex justify-center items-center'>
        <div className="w-32 aspect-square rounded-full relative flex justify-center items-center animate-[spin_3s_linear_infinite] z-40 bg-[conic-gradient(white_0deg,white_300deg,transparent_270deg,transparent_360deg)] before:animate-[spin_2s_linear_infinite] before:absolute before:w-[60%] before:aspect-square before:rounded-full before:z-[80] before:bg-[conic-gradient(white_0deg,white_270deg,transparent_180deg,transparent_360deg)] after:absolute after:w-3/4 after:aspect-square after:rounded-full after:z-[60] after:animate-[spin_3s_linear_infinite] after:bg-[conic-gradient(#1e40af_0deg,#1e40af_0deg,transparent_180deg,transparent_360deg)]">
          <span className="absolute w-[85%] aspect-square rounded-full z-[60] animate-[spin_5s_linear_infinite] bg-[conic-gradient(#3b82f6_0deg,#3b82f6_0deg,transparent_180deg,transparent_360deg)]"></span>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return <div>Verificando permissão...</div>;
  }

  return (
  <Layout>
    <div className="p-6 bg-gray-100 w-full h-full">
      <h1 className="text-2xl font-bold text-center mb-6">PDV - Pagamento</h1>
      <div className="flex space-x-8 h-[calc(100vh-6rem)]"> {/* Ajuste a altura conforme necessário */}
        {/* Carrinho */}
        <div className="w-2/3 p-4 bg-white shadow-md rounded-lg flex flex-col">
          <h2 className="text-xl font-semibold text-center mb-4">Carrinho</h2>
          <ul className="space-y-3 flex-1 overflow-y-auto"> {/* Flex-1 e overflow para rolagem */}
            {cart.map((item, index) => (
              <div className="flex justify-between items-center" key={index}>
                <li>{item.name} - R$ {item.price.toFixed(2)}</li>
                <button className="text-red-500" onClick={() => deleteCart(index)}>X</button>
              </div>
            ))}
          </ul>
        </div>

        {/* Selecção de cliente e funcionário */}
        <div className="w-1/3 p-4 bg-gray-800 text-white rounded-lg">
          <div className="space-y-4">
            {/* Selecção de cliente */}
            <div>
              <label className="block text-center mb-2">Selecione o Cliente:</label>
              <select
                className="w-full p-2 bg-gray-700 text-white rounded"
                onChange={(e) => handleClientSelection(e.target.value)}
                value={selectedClient?.id || ''}
              >
                <option value="">-- Selecione --</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
                <option value="avulso">Cliente Avulso</option>
              </select>
              <div className="mt-4">
                {selectedClient ? (
                  <div>
                    <p><strong>Cliente:</strong> {selectedClient.name}</p>
                    <p><strong>CPF:</strong> {formatCpfNumber(selectedClient.cpf)}</p>
                  </div>
                ) : (
                  <p>Nenhum cliente selecionado</p>
                )}
              </div>
            </div>

            {/* Selecção de funcionário */}
            <div>
              <label htmlFor="employee-select" className="block text-center mb-2">Atribuir Funcionário:</label>
              <select
                id="employee-select"
                className="w-full p-2 bg-gray-700 text-white rounded"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">Selecione um funcionário</option>
                {Employee.map((employee, index) => (
                  <option key={index} value={employee}>
                    {employee}
                  </option>
                ))}
              </select>
              <div className="mt-6">
                <h2 className="text-xl font-semibold">Busca de Produtos/Serviços</h2>
                <input
                  type="text"
                  className="w-full p-2 mt-2 border border-gray-300 rounded text-black"
                  placeholder="Digite o produto/serviço..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                />
                <div className="mt-4">
                  {searchTerm &&
                    filteredProducts.map((product, index) => (
                      <div
                        key={index}
                        className={`p-2 cursor-pointer ${highlightIndex === index ? 'bg-black' : ''}`}
                        onClick={() => addToCart(product)}
                        onMouseEnter={() => setHighlightIndex(index)}
                      >
                        {product.name} - R$ {product.price.toFixed(2)}
                      </div>
                    ))}
                  <div className="mt-6 text-center">
                    <button
                      onClick={handleSale}
                      className="p-2 bg-blue-500 text-white rounded-lg"
                    >
                      Finalizar Venda
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
);
};

export default Payment;