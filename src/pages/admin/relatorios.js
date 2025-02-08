import { useState, useEffect } from 'react';
import { fetchSales, fetchEmployees, fetchProducts } from '@lib/firestoreFunction';
import Layout from '@components/layout';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/router';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const Relatorios = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const salesData = await fetchSales();
        const employeesData = await fetchEmployees();
        const servicesData = await fetchProducts();

        setSales(Array.isArray(salesData.sales) ? salesData.sales : []);
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
        setServices(Array.isArray(servicesData) ? servicesData : []);
        setFilteredSales(Array.isArray(salesData.sales) ? salesData.sales : []);
      } catch (error) {}
    };
    loadData();
  }, []);

  const applyFilters = () => {
    let filtered = [...sales];
    const today = new Date();
    const todayFormatted = today.toLocaleDateString('pt-BR');
  
    filtered = filtered.filter(sale => {
      if (!sale?.date?.data) return false;
      const saleDateStr = sale.date.data;
      const saleDate = new Date(saleDateStr.split('/').reverse().join('-'));
      const isToday = saleDateStr === todayFormatted;
      return isToday || (saleDate >= startDate && saleDate <= endDate);
    });
  
    if (selectedEmployee && selectedEmployee !== 'Venda Avulsa') {
      filtered = filtered.filter(sale => {
        if (Array.isArray(sale.employee)) {
          return sale.employee.some(emp => emp.toLowerCase().trim() === selectedEmployee.toLowerCase().trim());
        } else if (typeof sale.employee === 'string') {
          return sale.employee.toLowerCase().trim() === selectedEmployee.toLowerCase().trim();
        }
        return false;
      });
    } else if (selectedEmployee === 'Venda Avulsa') {
      filtered = filtered.filter(sale => sale.employee === 'Venda Avulsa');
    }
  
    if (selectedService) {
      filtered = filtered.filter(sale => sale.items?.some(item => item.name === selectedService));
    }
  
    setFilteredSales(filtered);
  };
  

  const totalRevenue = Array.isArray(filteredSales)
    ? filteredSales.reduce((total, sale) => total + (sale.total || 0), 0)
    : 0;

  const totalServices = Array.isArray(filteredSales)
    ? filteredSales.reduce((total, sale) => total + (sale.items?.length || 0), 0)
    : 0;

  const getSalesByServiceData = () => {
    const serviceCounts = {};
    filteredSales.forEach(sale => {
      sale.items?.forEach(item => {
        serviceCounts[item.name] = (serviceCounts[item.name] || 0) + 1;
      });
    });
      

    return {
      labels: Object.keys(serviceCounts),
      datasets: [{
        data: Object.values(serviceCounts),
        backgroundColor: ['#4CAF50', '#FFC107', '#2196F3', '#FF5722'],
        hoverBackgroundColor: ['#388E3C', '#FFB300', '#1976D2', '#F4511E'],
        borderColor: '#fff',
        borderWidth: 3,
      }]
    };
  };


  const getSalesOverTimeData = () => {
    const salesByDate = {};
    filteredSales.forEach(sale => {
      const saleDate = new Date(sale.date?.data).toLocaleDateString('pt-BR');
      salesByDate[saleDate] = (salesByDate[saleDate] || 0) + (sale.total || 0);
    });

    return {
      labels: Object.keys(salesByDate),
      datasets: [{
        label: 'Vendas por Data',
        data: Object.values(salesByDate),
        backgroundColor: '#4CAF50',
        borderColor: '#388E3C',
        borderWidth: 1
      }]
    };
  };


  return (
    <Layout>
      <div className="p-6 bg-gray-100 w-full text-black">
        <h1 className="text-2xl font-bold text-center mb-6">Relatórios</h1>
        <div className="flex space-x-4 mb-6">
          <div>
            <label className="block mb-2">Data Inicial:</label>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              className="p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Data Final:</label>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              className="p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Funcionário:</label>
            <select
              className="p-2 border rounded"
              value={selectedEmployee}
              onChange={e => setSelectedEmployee(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Venda Avulsa">Venda Avulsa</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.name}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2">Serviço:</label>
            <select
              className="p-2 border rounded"
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
            >
              <option value="">Todos</option>
              {services.map(service => (
                <option key={service.id} value={service.name}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => applyFilters()}
            className="p-2 bg-blue-500 text-white rounded mt-6"
          >
            Aplicar Filtros
          </button>
        </div>
        

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white shadow rounded">
            <h2 className="text-lg font-semibold">Total de Vendas</h2>
            <p className="text-2xl">R$ {totalRevenue.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-white shadow rounded">
            <h2 className="text-lg font-semibold">Total de Serviços</h2>
            <p className="text-2xl">{totalServices}</p>
          </div>
          <div className="p-4 bg-white shadow rounded">
            <h2 className="text-lg font-semibold">Média por Dia</h2>
            <p className="text-2xl">R$ {(totalRevenue / (filteredSales.length || 1)).toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold mb-4">Detalhes das Vendas</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Data</th>
                <th className="text-left">Cliente</th>
                <th className="text-left">Funcionário</th>
                <th className="text-left">Serviços</th>
                <th className="text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(filteredSales) && filteredSales.length > 0 ? (
                filteredSales.map((sale, index) => (
                  <tr key={index}>
                    <td>{sale.date?.data || 'N/A'}</td>
                    <td>{sale.clientName || 'N/A'}</td>
                    <td>{sale.employee || 'N/A'}</td>
                    <td>
                      {sale.items?.map((item, i) => (
                        <div key={i}>{item.name}</div>
                      )) || 'N/A'}
                    </td>
                    <td>R$ {sale.total?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">Nenhum dado encontrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6 pt-6">
          <div className="p-4 bg-white shadow rounded">
            <h2 className="text-lg font-semibold mb-4 h-[px]">Vendas por Serviço</h2>
            <Pie data={getSalesByServiceData()}/>

          </div>
          <div className="p-4 bg-white shadow rounded">
            <h2 className="text-lg font-semibold mb-4">Vendas ao Longo do Tempo</h2>
            <Bar data={getSalesOverTimeData()} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Relatorios;
