'use client'
import React from 'react';
import Modal from 'react-modal';


const AppointmentsDetails = ({ isOpen, onClose, event }) => {
  if (!event) return null;

    const startDate = new Date(event.start).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const endDate = new Date(event.end).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  return (
      <div id="root">
        <h1 className="text-2xl font-bold">Agendamentos</h1>
        <Modal isOpen={isOpen} onRequestClose={onClose} className='absolute left-[50%] top-[50%] transform -translate-x-[50%] -translate-y-[50%] bg-white text-black border rounded-xl w-1/3 h-1/3 flex flex-col justify-center items-center gap-5'>
          <h2>{event.id ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
          <p>Cliente: {event.costumer}</p>
          <p>Início: {startDate}</p>
          <p>Fim: {endDate}</p>
          <button onClick={onClose} className="bg-red-500 text-white p-2 rounded">Fechar</button>
          <button onClick={() => handleOpenModal(event)} className="bg-blue-500 text-white p-2 rounded">Editar</button>
        </Modal>
      </div>

  );
};

export default AppointmentsDetails;
