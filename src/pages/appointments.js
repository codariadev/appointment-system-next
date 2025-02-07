
'use client'
import React, { useEffect, useLayoutEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react'; 
import dayGridPlugin from '@fullcalendar/daygrid'; 
import timeGridPlugin from '@fullcalendar/timegrid'; 
import interactionPlugin from '@fullcalendar/interaction';
import Modal from 'react-modal';
import Select from 'react-select';
import { format } from 'date-fns';



import { saveAppointment, fetchAppointments, fetchClients, deleteAppointment, fetchProducts } from '@lib/firestoreFunction';
import Layout from '@components/layout';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/router';

const Appointments = () => {
  const [events, setEvents] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceDetails, setServiceDetails] = useState([]);
  const [clients, setClients] = useState([]);
  const [newEvent, setNewEvent] = useState({ start: '', end: '', costumer: '', cpf: '', service: '' });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [calendarIsOpen, setCalendarIsOpen] = useState(false);

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
        Modal.setAppElement('#root');
        const loadAppointmentsAndProducts = async () => {
            try {
              const appointments = await fetchAppointments();
              const mappedAppointments = appointments.map((appointment) => ({
                ...appointment,
                title: appointment.costumer,
              }));
      
              setEvents(mappedAppointments);
      
              const clientsData = await fetchClients();
              const formattedClients = clientsData.map((client) => ({
                value: client.name,
                label: client.name,
                cpf: client.cpf
              }));
              setClients(formattedClients);
      
              const productsData = await fetchProducts();
              const filteredServices = productsData
                .filter((product) => product.category == 'Serviço')
                .map((product) => ({
                  value: product.name,
                  label: `${product.name} - R$ ${product.price.toFixed(2)}`,
                  price: product.price,
                }));
      
                setServices(filteredServices);
      
            } catch (error) {
              console.log('Erro ao carregar dados', error);
            }
        };
      
        if (authorized) {
          loadAppointmentsAndProducts();  // Carrega os dados assim que o usuário for autorizado
        }
      }, [authorized]);

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


  const handleOpenModal = (appointment = { start: '', end: '', costumer: '', id: '' }) => {
    setNewEvent(appointment);
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setNewEvent({ start: '', end: '', costumer: '' });
  };
  const handleOpenCalendar = () => {
    setCalendarIsOpen(true);
  };

  const handleCloseCalendar = () => {
    setCalendarIsOpen(false);

  };

  const handleCloseCalendarOpenModal = () => {
    setCalendarIsOpen(false);
    handleOpenModal();
  }

  const handleDeleteAppointment = async (appointment) => {
    try {
      await deleteAppointment(appointment);
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== appointment.id));
      alert('Agendamento deletado com sucesso.');
      
    } catch (error) {
      console.log('Erro ao deletar:', error);
    }
  };

  const handleSaveAppointment = async () => {
    if (!newEvent.start || !newEvent.end || !newEvent.costumer || !newEvent.service) {
      alert('Preencha todos os campos antes de salvar.');
      return;
    }
  
    try {
      const selectedService = services.find((service) => service.value === newEvent.service);
      const appointment = {
        start: newEvent.start,
        end: newEvent.end,
        costumer: newEvent.costumer,
        cpf: newEvent.cpf,
        service: newEvent.service
      };
  
      // Verifique se o ID está presente para salvar ou atualizar
      if (newEvent.id) {
        // Atualiza agendamento existente
        await saveAppointment(appointment, newEvent.id);
        setEvents((preEvents) => 
          preEvents.map((event) =>
            event.id === newEvent.id ? { ...event, ...appointment } : event
          )
        );
        alert('Agendamento atualizado com sucesso.');
      } else {
        // Cria novo agendamento
        const id = await saveAppointment(appointment);
        setEvents((preEvents) => [...preEvents, { id, ...appointment }]);
        alert('Agendamento salvo com sucesso');
      }
  
      if (selectedService) {
        setServiceDetails((prevDetails) => [
          ...prevDetails,
          {
            name: selectedService.value,
            price: selectedService.price,
          },
        ]);
      }
      handleCloseModal();
    } catch (error) {
      console.log('Erro ao salvar o agendamento', error);
    }
  };
  

  const handleDateClick = (info) => {
    alert(`Data clicada: ${info.dateStr}`);
  };


  return (
    <Layout>
      <div className="p-5 flex flex-col gap-2 items-center w-full h-full rounded text-black bg-white" id="root">
        <div className="text-center mb-6 bg-gray-100 p-8 rounded-lg shadow-lg w-full">
          <h1 className="text-2xl font-bold">Agendamentos</h1>
          <p className="text-gray-600">Gerencie seus horários e compromissos</p>
        </div>
        <button className="bg-blue-500 text-white px-2 text-xs py-2 rounded-md hover:bg-blue-600" onClick={() => handleOpenModal()}>Adicionar Agendamento</button>
        <button className="bg-blue-500 text-white px-2 text-xs py-2 rounded-md hover:bg-blue-600" onClick={() => handleOpenCalendar()}>Abrir o calendario</button>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={handleCloseModal}
          className="fixed top-1/2 left-1/2 translate-x-[-30%] translate-y-[-50%] w-1/2 bg-[#fff] rounded-8 shadow-2xl p-8 z-10 flex flex-col text-black"
          contentLabel="Novo Agendamento"
        >
          <h2 className='text-center font-bold'>{newEvent.id ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
          <form>
            <div className="label-content flex flex-col space-y-3 mb-4">
              <label>Cliente:</label>
              <Select
                className="select-client"
                options={clients}
                onChange={(selectedOption) =>
                  setNewEvent({ ...newEvent, costumer: selectedOption ? selectedOption.value : '', cpf: selectedOption ? selectedOption.cpf : '' })
                }
                isClearable
                placeholder="Selecione ou digite um cliente..."
                value={newEvent.costumer ? { value: newEvent.costumer, label: newEvent.costumer } : null}
                noOptionsMessage={() => 'Nenhum cliente encontrado'}
              />
              <label>Início:</label>
              <input
                type="datetime-local"
                value={newEvent.start}
                onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                className="p-2 border rounded"
              />
              <label>Fim:</label>
              <input
                type="datetime-local"
                value={newEvent.end}
                onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                className="p-2 border rounded"
              />
              <label>Serviço Primário</label>
              <Select
                className="flex-grow"
                options={services}
                onChange={(selectedOption) =>
                  setNewEvent({
                    ...newEvent,
                    service: selectedOption ? { name: selectedOption.value, price: selectedOption.price } : ''
                  })
                }
                isClearable
                placeholder="Selecione ou digite um serviço..."
                value={
                  newEvent.service
                    ? { value: newEvent.service.name, label: `${newEvent.service.name} - R$ ${newEvent.service.price.toFixed(2)}` }
                    : null
                }
                noOptionsMessage={() => 'Nenhum serviço encontrado'}
              />
            </div>
            <div className="input-content flex flex-col space-y-3">
              
            </div>
          </form>
          <div className="modal-actions flex justify-end space-x-3 mt-4">
            <button onClick={handleCloseModal} className="bg-gray-400 text-white p-2 rounded">Cancelar</button>
            <button onClick={() => handleDeleteAppointment(newEvent)} className="bg-red-500 text-white p-2 rounded">Deletar</button>
            <button onClick={handleSaveAppointment} className="bg-blue-500 text-white p-2 rounded">{newEvent.id ? 'Salvar Alterações' : 'Adicionar'}</button>
          </div>
        </Modal>
        <Modal
          isOpen={calendarIsOpen}
          onRequestClose={handleCloseCalendar}
          className=" w-full h-full bg-[#fff] rounded-8 shadow-2xl p-8 z-10 flex flex-col justify-center items-center bg-transparent"
          contentLabel="Novo Agendamento"
        >
          <div className="w-[90%] h-[90%] bg-gray-200 p-4 rounded-lg shadow-md text-black">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events.map((event) => ({
              ...event,
              key: event.id, // Atribuindo uma chave única a cada evento
            }))}
            dateClick={handleDateClick}
            buttonText={{today: 'Hoje', month: 'Mês', week: 'Semana', day: 'dia'}}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            locale="pt" // Aqui está a configuração para português
            eventContent={(eventInfo) => {
              const isPast = new Date(eventInfo.event.start) < new Date();
              return (
                <div className={`font-[10px] ${isPast ? 'text-red-500' : ''}`}>
                  <span>{eventInfo.event.title.split(' ')[0]}</span>
                </div>
              );
            }}
            height="95%"
          />

          </div>
         
          <div className="modal-actions flex justify-end space-x-3 mt-4">
            <button onClick={handleCloseCalendar} className="bg-gray-400 text-white p-2 rounded">Cancelar</button>
            <button onClick={handleCloseCalendarOpenModal} className="bg-blue-500 text-white p-2 rounded">{newEvent.id ? 'Salvar Alterações' : 'Adicionar'}</button>
          </div>
        </Modal>

        <div className="z-0 flex justify-between gap-6 bg-gray-100 p-8 rounded-lg shadow-lg flex-grow w-full">
          
        <div className='w-full flex justify-evenly gap-5'>
          <div className="w-1/2 p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl text-center mb-4">Agendamentos Expirados</h2>
            {events.length !== 0 ? (
              <ul>
                {events
                  .filter((event) => new Date(event.start) <= new Date())
                  .sort((a, b) => new Date(a.start) - new Date(b.start))
                  .map((event) => (
                    <li key={event.id} className="flex justify-between w-full p-4 mb-2 bg-white rounded-lg shadow-sm">
                      <div className='flex w-full justify-evenly items-center gap-5 px-4 bg-gray-200 rounded-md'>
                        <strong>{event.costumer}</strong>
                        {format(new Date(event.start), 'dd/MM/yyyy')}<p/>
                        {format(new Date(event.start), 'HH:mm')} até
                        {format(new Date(event.end), ' HH:mm')}
                      </div>
                      <button onClick={() => handleOpenModal(event)} className="bg-blue-500 text-white px-2 text-sm rounded">Baixar</button>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">Sem agendamentos expirados</p>
            )}
          </div>
          <div className="w-1/2 p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl text-center mb-4">Próximos Agendamentos</h2>
            {events.length !== 0 ? (
              <ul>
                {events
                  .filter((event) => new Date(event.start) >= new Date())
                  .sort((a, b) => new Date(a.start) - new Date(b.start))
                  .map((event) => (
                    <li key={event.id} className="flex justify-between w-full p-4 mb-2 bg-white rounded-lg shadow-sm">
                      <div className='flex w-full justify-evenly items-center gap-5 px-4 bg-gray-200 rounded-md'>
                        <strong>{event.costumer}</strong>
                        {format(new Date(event.start), 'dd/MM/yyyy')}<p/>
                        {format(new Date(event.start), 'HH:mm')} até
                        {format(new Date(event.end), ' HH:mm')}
                      </div>
                      <button onClick={() => handleOpenModal(event)} className="bg-blue-500 text-white px-2 text-sm rounded">Editar</button>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">Sem agendamentos próximos</p>
            )}
          </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Appointments;
