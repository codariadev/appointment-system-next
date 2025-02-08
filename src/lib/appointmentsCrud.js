// appointmentCrud.js
import { saveAppointment, fetchAppointments, deleteAppointment, fetchClients, fetchProducts } from '@lib/firestoreFunction';

export const fetchAllAppointments = async () => {
  try {
    const appointments = await fetchAppointments();
    return appointments.map((appointment) => ({
      ...appointment,
      title: appointment.costumer,
      start: appointment.start
    }));
  } catch (error) {
    console.log('Erro ao carregar agendamentos:', error);
    return [];
  }
};

export const handleSaveAppointment = async (newEvent, services, setEvents, setServiceDetails, handleCloseModal) => {
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
    if (newEvent.id) {
      await saveAppointment(appointment, newEvent.id);
      setEvents((preEvents) => 
        preEvents.map((event) =>
          event.id === newEvent.id ? { ...event, ...appointment } : event
        )
      );
      alert('Agendamento atualizado com sucesso.');
    } else {
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

export const handleDeleteAppointment = async (appointment, setEvents) => {
  try {
    await deleteAppointment(appointment);
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== appointment.id));
    alert('Agendamento deletado com sucesso.');
  } catch (error) {
    console.log('Erro ao deletar:', error);
  }
};


export const loadClientsAndProducts = async (clients, setClients, services, setServices) => {
  try {
    const clientsData = await fetchClients();
    const formattedClients = clientsData.map((client) => ({
      value: client.name,
      label: client.name,
      cpf: client.cpf,
    }));
    setClients(formattedClients);

    const productsData = await fetchProducts();
    const filteredServices = productsData
      .filter((product) => product.category === 'Serviço')
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
