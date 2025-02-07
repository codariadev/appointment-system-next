'use client'
import React, { useEffect, useState } from 'react';
import { addProduct, deleteProduct, fetchProducts, updateProduct } from '@lib/firestoreFunction';
import Layout from '@/components/layout';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/router';

export default function Stock() {
    const [products, setProducts] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", description: "", price: "0", category: "Serviço", estoque: "" });
    const [currentProduct, setCurrentProduct] = useState(null);
    const [filter, setFilter] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');

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
        const loadProducts = async () => {
            try {
                const productsList = await fetchProducts();
                setProducts(productsList);
            } catch (error) {
                console.error('Erro ao carregar produtos:', error);
            }
        };      
        if (authorized) {
            loadProducts();  // Carrega os dados assim que o usuário for autorizado
          }
    }, [authorized]);

    const handleOpenModal = (product = null) => {
        setCurrentProduct(product);
        setFormData(product || { name: "", description: "", price: "0", category: "Serviço", estoque: "" });
        setModalIsOpen(true);
    };

    const handleCloseModal = () => {
        setModalIsOpen(false);
        setCurrentProduct(null);
        setFormData({ name: "", description: "", price: "0", category: "Serviço", estoque: "" });
    };

    const formatPriceForDisplay = (price) => {
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice)) return "R$ 0,00";
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(parsedPrice);
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: name === "price" ? value : value,
        }));
    };
    
    const handleToggleCategory = (selectedCategory) => {
        setFormData(prevState => ({
            ...prevState,
            category: selectedCategory,
            estoque: selectedCategory === "Produto" ? prevState.estoque : ""}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formattedData = { 
            ...formData, 
            price: parseFloat(String(formData.price).replace(",", ".")),
        };
        try {
            if (currentProduct) {
                await updateProduct(currentProduct.id, formattedData);
            } else {
                console.log('Adicionando produto');
                await addProduct(formattedData);
            }
            const updatedProducts = await fetchProducts();
            setProducts(updatedProducts);
            handleCloseModal();
        } catch (error) {
            console.error('Erro ao salvar produto/serviço:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteProduct(id);
            const updatedProducts = await fetchProducts();
            setProducts(updatedProducts);
        } catch (error) {
            console.error('Erro ao excluir produto/serviço:', error);
        }
    };

    const filteredProducts = (Array.isArray(products) ? products : []).filter(product => {
        const matchesCategory = filter === 'Todos' || product.category === filter;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (loading) {

        const timer = setTimeout(() => 1000);
        const clearTime = clearTimeout(timer);
  
      return (
        <div className='w-full h-screen flex justify-center items-center'>
          <div
            className="w-32 aspect-square rounded-full relative flex justify-center items-center animate-[spin_3s_linear_infinite] z-40 bg-[conic-gradient(white_0deg,white_300deg,transparent_270deg,transparent_360deg)] before:animate-[spin_2s_linear_infinite] before:absolute before:w-[60%] before:aspect-square before:rounded-full before:z-[80] before:bg-[conic-gradient(white_0deg,white_270deg,transparent_180deg,transparent_360deg)] after:absolute after:w-3/4 after:aspect-square after:rounded-full after:z-[60] after:animate-[spin_3s_linear_infinite] after:bg-[conic-gradient(#1e40af_0deg,#1e40af_0deg,transparent_180deg,transparent_360deg)]"
          >
            <span
              className="absolute w-[85%] aspect-square rounded-full z-[60] animate-[spin_5s_linear_infinite] bg-[conic-gradient(#3b82f6_0deg,#3b82f6_0deg,transparent_180deg,transparent_360deg)]"
            >
            </span>
          </div>
        </div>
  
      )
    }
      if (!authorized) {
        return <div>Verificando permissão...</div>;
      }
    

    return (
        <Layout>
        <div className="p-5 flex flex-col gap-2 items-center w-full h-full rounded text-black bg-white">
            <div className="text-center mb-6 bg-gray-100 p-8 rounded-lg shadow-lg w-full">
                <h1 className="text-2xl font-bold">Produtos e Serviços</h1>
                <p className="text-gray-600">Gerencie serviços disponíveis e os produtos</p>
            </div>

            <button
                className="bg-blue-500 text-white px-2 text-xs py-2 rounded-md hover:bg-blue-600"
                onClick={() => handleOpenModal()} 
                aria-label="Adicionar Produto/Serviço"
            >
                Adicionar Produto/Serviço
            </button>

            <div className="filter-buttons mb-4 flex gap-4">
                <input 
                    type="text" 
                    className="px-2 border border-gray-400 rounded-md"
                    placeholder="Pesquisar por nome..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Pesquisar produtos e serviços"
                />
                <button
                    className={`"bg-blue-500 text-black px-2 text-xs py-2 rounded-md hover:bg-blue-600 ${filter === "Todos" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setFilter("Todos")}
                    aria-label="Filtrar todos"
                >
                    Todos
                </button>
                <button
                    className={`"bg-blue-500 text-black px-2 text-xs py-2 rounded-md hover:bg-blue-600 ${filter === "Serviço" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setFilter("Serviço")}
                    aria-label="Filtrar serviços"
                >
                    Serviços
                </button>
                <button
                    className={`"bg-blue-500 text-black px-2 text-xs py-2 rounded-md hover:bg-blue-600 ${filter === "Produto" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setFilter("Produto")}
                    aria-label="Filtrar produtos"
                >
                    Produtos
                </button>
            </div>

            <div className="overflow-x-auto w-full bg-gray-100 rounded-lg shadow-md p-4">
                <table className="min-w-full table-auto border-spacing-0 rounded-lg border-collapse">
                    <thead>
                        <tr className="flex justify-between py-2 bg-gray-800 text-white text-xs rounded-md">
                            <th className="w-1/5">Nome</th>
                            <th className="flex-1">Tipo</th>
                            <th className="w-1/3">Descrição</th>
                            <th className="flex-1">Estoque</th>
                            <th className="flex-1">Preço</th>
                            <th className="flex-1">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className="flex justify-between items-center text-sm">
                                <td className="px-4 py-2  - w-1/5">{product.name}</td>
                                <td className="px-4 py-2 text-center  - flex-1">{product.category}</td>
                                <td className="px-4 py-2  - w-1/3">{product.description}</td>
                                <td className="px-4 py-2  - flex-1 text-center">{product.category === "Produto" ? product.estoque : "N/A"}</td>
                                <td className="px-4 py-2  - flex-1 text-center">{formatPriceForDisplay(product.price)}</td>
                                <td className="px-4 text-center py-2 flex-nowrap gap-2 flex">
                                    <button
                                        className="bg-yellow-500 text-white text-xs p-2 rounded-md"
                                        onClick={() => handleOpenModal(product)} 
                                        aria-label="Editar Produto/Serviço"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="bg-red-500 text-white text-xs p-2 rounded-md"
                                        onClick={() => handleDelete(product.id)} 
                                        aria-label="Excluir Produto/Serviço"
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modalIsOpen && (
                <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <form className="bg-white p-6 rounded-md shadow-lg w-96" onSubmit={handleSubmit}>
                        <h2 className="text-2xl mb-4">{currentProduct ? "Editar Produto/Serviço" : "Adicionar Produto/Serviço"}</h2>
                        <label className="block mb-2">
                            Nome:
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full p-2 border rounded-md"
                            />
                        </label>
                        <label className="block mb-2">
                            Descrição:
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                className="w-full p-2 border rounded-md"
                            />
                        </label>
                        <label className="block mb-2">
                            Preço:
                            <input
                                type="text"
                                name="price"
                                value={String(formData.price).replace(".", ",")}
                                onChange={handleInputChange}
                                required
                                className="w-full p-2 border rounded-md"
                            />
                        </label>
                        {formData.category === "Produto" && (
                            <label className="block mb-2">
                                Estoque:
                                <input
                                    type="number"
                                    name="estoque"
                                    value={formData.estoque}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-2 border rounded-md"
                                />
                            </label>
                        )}
                        <div className="flex gap-2 mb-4">
                            <button
                                type="button"
                                className={`px-4 py-2 rounded-md ${formData.category === "Serviço" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                                onClick={() => handleToggleCategory("Serviço")}
                            >
                                Serviço
                            </button>
                            <button
                                type="button"
                                className={`px-4 py-2 rounded-md ${formData.category === "Produto" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                                onClick={() => handleToggleCategory("Produto")}
                            >
                                Produto
                            </button>
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md">Salvar</button>
                            <button type="button" onClick={handleCloseModal} className="bg-gray-500 text-white px-4 py-2 rounded-md">Cancelar</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
        </Layout>
    );
}