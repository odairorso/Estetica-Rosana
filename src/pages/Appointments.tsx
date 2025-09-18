// ... código anterior mantido ...

useEffect(() => {
  console.log('Agendamentos carregados:', appointments);
  console.log('Agendamentos filtrados:', filteredAppointments);
}, [appointments, filteredAppointments]);

// ... resto do código mantido ...