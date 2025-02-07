import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { fetchEmployees, addEmployee, updateEmployee, deleteEmployee } from '@lib/firestoreFunction';
import Layout from '@components/layout';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/router';

export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState({ id: null, name: '', cpf: '', email: '', phone: '', role: '' });
    const [errors, setErrors] = useState({});
    
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

        if (typeof window !== "undefined") {
            Modal.setAppElement('#root');
        }

        const loadEmployees = async () => {
            try {
                const fetchedEmployees = await fetchEmployees();
                if (Array.isArray(fetchedEmployees)) {
                    setEmployees(fetchedEmployees);
                } else {
                    console.error('Erro: dados de funcionários não são um array:', fetchedEmployees);
                }
            } catch (error) {
                console.error('Erro ao buscar funcionários:', error);
            }
        };
        loadEmployees();
    }, [user, loading, router]);

    const handleOpenModal = (employee = { name: '', cpf: '', email: '', phone: '', role: '' }) => {
        setCurrentEmployee(employee);
        setErrors({});
        setModalIsOpen(true);
    };

    const handleCloseModal = () => {
        setModalIsOpen(false);
        setCurrentEmployee({ id: null, name: '', cpf: '', email: '', phone: '', role: '' });
        setErrors({});
    };

    const handleSaveEmployee = async (e) => {
        e.preventDefault();
        if (!currentEmployee.name.trim() || !currentEmployee.email.trim() || !currentEmployee.phone.trim()) {
            setErrors({
                name: !currentEmployee.name.trim() ? 'O nome é obrigatório.' : '',
                email: !currentEmployee.email.trim() ? 'O email é obrigatório.' : '',
                phone: !currentEmployee.phone.trim() ? 'O telefone é obrigatório.' : ''
            });
            return;
        }
        try {
            const employeeData = { ...currentEmployee, createdAt: new Date().getTime() };
            currentEmployee.id ? await updateEmployee(currentEmployee.id, employeeData) : await addEmployee(employeeData);
            handleCloseModal();
            setEmployees(await fetchEmployees());
        } catch (error) {
            console.error('Erro ao salvar funcionário:', error);
        }
    };
    
    const handleDeleteEmployee = async (employeeId) => {
        if (!window.confirm('Tem certeza que deseja excluir este funcionário?')) {
            return;
        }
        try {
            await deleteEmployee(employeeId);
            setEmployees(await fetchEmployees());
        } catch (error) {
            console.error('Erro ao excluir o funcionário', error);
        }
    };

    if (loading) {
        return <div>Carregando...</div>;
    }

    if (!authorized) {
        return <div>Verificando permissão...</div>;
    }

    return (
        <Layout>
            <div className="p-5 flex flex-col items-center w-full h-full rounded text-black bg-white" id="root">
                <div className="text-center mb-6 bg-gray-100 p-8 rounded-lg shadow-lg w-full">
                    <h1 className="text-2xl font-bold">Funcionários</h1>
                    <p className="text-gray-600">Gerencie seus funcionários cadastrados</p>
                </div>
                <button className="bg-blue-500 text-white px-2 text-xs py-2 rounded-md hover:bg-blue-600" onClick={() => handleOpenModal()}>Adicionar Funcionário</button>
                {modalIsOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                        <form className="bg-white p-6 rounded-lg shadow-lg w-96" onSubmit={handleSaveEmployee}>
                            <h2 className="text-lg font-bold mb-4">{currentEmployee.id ? 'Editar Funcionário' : 'Novo Funcionário'}</h2>
                            <label className="block mb-2">Nome:<input type="text" className="w-full border p-2 rounded" value={currentEmployee.name} onChange={(e) => setCurrentEmployee({ ...currentEmployee, name: e.target.value })} required /></label>
                            <label className="block mb-2">CPF:<input type="number" className="w-full border p-2 rounded" value={currentEmployee.cpf} onChange={(e) => setCurrentEmployee({ ...currentEmployee, cpf: e.target.value })} required /></label>
                            <label className="block mb-2">Email:<input type="email" className="w-full border p-2 rounded" value={currentEmployee.email} onChange={(e) => setCurrentEmployee({ ...currentEmployee, email: e.target.value })} required /></label>
                            <label className="block mb-4">Telefone:<input type="text" className="w-full border p-2 rounded" value={currentEmployee.phone} onChange={(e) => setCurrentEmployee({ ...currentEmployee, phone: e.target.value })} required /></label>
                            <label className="block mb-4">Cargo:
                                <select className="w-full border p-2 rounded" value={currentEmployee.role} onChange={(e) => setCurrentEmployee({ ...currentEmployee, role: e.target.value })} required>
                                    <option value="">Selecione um cargo</option>
                                    <option value="Administrador">Supervisor</option>
                                    <option value="Gerente">Gerente</option>
                                    <option value="Atendente">Atendente</option>
                                    <option value="Barbeiro">Barbeiro</option>
                                </select>
                            </label>
                            <div className="flex justify-end space-x-2">
                                <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600" onClick={handleCloseModal}>Cancelar</button>
                                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">{currentEmployee.id ? 'Salvar Alterações' : 'Adicionar'}</button>
                            </div>
                        </form>
                    </div>
                )}
                <div className="overflow-x-auto w-full bg-gray-100 rounded-lg shadow-md p-4">
                    <table className="min-w-full table-auto border-spacing-0 rounded-lg border-collapse">
                        <thead>
                            <tr className='flex justify-between py-2 bg-gray-800 text-white text-xs rounded-md'>
                                <th className="w-1/4">Nome</th>
                                <th className="w-1/3">Email</th>
                                <th className="w-1/4">Telefone</th>
                                <th className="flex-1">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((employee) => (
                                <tr key={employee.id} className="flex justify-between items-center text-sm">
                                    <td className="px-4 py-2 w-1/4">{employee.name}</td>
                                    <td className="px-4 py-2 w-1/3 text-center">{employee.email}</td>
                                    <td className="px-4 py-2 w-1/4 text-center">{employee.phone}</td>
                                    <td className="px-4 py-2 flex-1 flex-nowrap gap-2 flex justify-center">
                                        <button className="bg-yellow-500 text-white text-xs p-2 rounded-md" onClick={() => handleOpenModal(employee)}>Editar</button>
                                        <button className="bg-red-500 text-white text-xs p-2 rounded-md" onClick={() => handleDeleteEmployee(employee.id)}>Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}
