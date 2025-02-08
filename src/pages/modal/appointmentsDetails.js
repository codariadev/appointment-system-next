'use client'
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Select from 'react-select';
import { handleSaveAppointment, handleDeleteAppointment, loadClientsAndProducts } from '@/lib/appointmentsCrud';

const AppointmentsDetails = ({ isOpen, onClose, event }) => {
  if (!event) return null;

  const startDate = new Date(event.start).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const endDate = new Date(event.end).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  // Estados para clientes e serviços
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);

  // Estado para o evento a ser editado
  const [newEvent, setNewEvent] = useState({
    id: '',
    start: '',
    end: '',
    costumer: { value: '', label: '' },
    cpf: '',
    service: { value: '', label: '' }
  });

  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    // Carregar clientes e produtos quando o modal for aberto
    if (isOpen) {
      loadClientsAndProducts(clients, setClients, services, setServices);
    }
  }, [isOpen]);

  useEffect(() => {
    // Se houver evento, preenche os campos do modal com os dados do evento
    if (event) {
      setNewEvent({
        id: event.id || '',
        start: event.start || '',
        end: event.end || '',
        costumer: { value: event.costumer || '', label: event.costumer || '' },
        cpf: event.cpf || '',
        service: { value: event.service || '', label: event.service || '' }
      });
    }
  }, [event]);

  const handleOpenModal = () => {
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
  };

  return (
    <div id="root">
      <h1 className="text-2xl font-bold">Agendamentos</h1>

      {/* Modal de Detalhes */}
      <Modal 
        isOpen={isOpen} 
        onRequestClose={onClose} 
        className='absolute left-[50%] top-[50%] transform -translate-x-[50%] -translate-y-[50%] bg-white text-black border rounded-xl w-1/3 h-1/3 flex flex-col justify-center items-center gap-5'
      >
        <h2>{event.id ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
        <p>Cliente: {event.costumer}</p>
        <p>Início: {startDate}</p>
        <p>Fim: {endDate}</p>
        <button onClick={onClose} className="bg-red-500 text-white p-2 rounded">Fechar</button>
        <button onClick={handleOpenModal} className="bg-blue-500 text-white p-2 rounded">Editar</button>
      </Modal>

      {/* Modal de Edição */}
      {event && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={handleCloseModal}
          className="fixed top-1/2 left-1/2 translate-x-[-30%] translate-y-[-50%] w-1/2 bg-[#fff] rounded-8 shadow-2xl p-8 z-10 flex flex-col text-black"
          contentLabel="Novo Agendamento"
        >
          <h2 className='text-center font-bold'>{event.id ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
          <form>
            <div className="label-content flex flex-col space-y-3 mb-4">
              <label>Cliente:</label>
              <Select
                className="select-client"
                onChange={(selectedOption) =>
                  setNewEvent({ ...newEvent, costumer: selectedOption || { value: '', label: '' } })
                }
                isClearable
                placeholder="Selecione ou digite um cliente..."
                value={newEvent.costumer}
                options={clients}
              />

              <label>Início:</label>
              <input
                type="datetime-local"
                value={newEvent.start ? new Date(newEvent.start).toISOString().slice(0, 16) : ''}
                onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                className="p-2 border rounded"
              />

              <label>Fim:</label>
              <input
                type="datetime-local"
                value={newEvent.end ? new Date(newEvent.end).toISOString().slice(0, 16) : ''} 
                onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                className="p-2 border rounded"
              />

              <label>Serviço:</label>
              <Select
                className="flex-grow"
                onChange={(selectedOption) =>
                  setNewEvent({ ...newEvent, service: selectedOption || { value: '', label: '' } })
                }
                isClearable
                placeholder="Selecione um serviço..."
                value={services}
                options={services}
              />
            </div>
          </form>

          <div className="modal-actions flex justify-end space-x-3 mt-4">
            <button onClick={handleCloseModal} className="bg-gray-400 text-white p-2 rounded">Cancelar</button>
            <button onClick={() => handleDeleteAppointment(newEvent)} className="bg-red-500 text-white p-2 rounded">Deletar</button>
            <button onClick={() => handleSaveAppointment(newEvent)} className="bg-blue-500 text-white p-2 rounded">
              {newEvent.id ? 'Salvar Alterações' : 'Adicionar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AppointmentsDetails;
