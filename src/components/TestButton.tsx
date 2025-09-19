import { Button } from "@/components/ui/button";

export function TestButton() {
  const addTestData = () => {
    console.log('🚀 Iniciando teste de sessões numeradas...');
    
    // Limpar dados existentes
    localStorage.removeItem('clinic-appointments-v2');
    localStorage.removeItem('clinic-sales-v2');
    
    // Criar venda de teste com pacote de 8 sessões
    const testSale = {
      id: Date.now(),
      client_id: 1001,
      client_name: "Ana Costa Teste",
      client_phone: "(11) 99999-9999",
      package_id: 2001,
      package_name: "Pacote Premium Teste",
      total_sessions: 8,
      price: 800,
      sale_date: new Date().toISOString().split('T')[0],
      type: "package_session",
      status: "confirmed"
    };
    
    // Salvar venda
    const sales = [testSale];
    localStorage.setItem('clinic-sales-v2', JSON.stringify(sales));
    console.log('✅ Venda de teste criada:', testSale);
    
    // Criar 8 agendamentos para as sessões
    const appointments = [];
    for (let i = 1; i <= 8; i++) {
      appointments.push({
        id: Date.now() + i,
        client_id: 1001,
        client_name: "Ana Costa Teste",
        client_phone: "(11) 99999-9999",
        package_id: 2001,
        package_name: "Pacote Premium Teste",
        total_sessions: 8,
        session_number: i,
        price: 0,
        sale_date: new Date().toISOString().split('T')[0],
        type: "package_session",
        status: "agendado",
        notes: `Sessão ${i} de 8`,
        duration: 60,
        date: "", // Vazio para agendamento posterior
        time: "",
        created_at: new Date().toISOString()
      });
    }
    
    // Salvar agendamentos
    localStorage.setItem('clinic-appointments-v2', JSON.stringify(appointments));
    console.log('✅ 8 sessões criadas:', appointments);
    
    // Recarregar página
    window.location.reload();
  };

  return (
    <Button 
      onClick={addTestData}
      variant="outline"
      className="mb-4"
    >
      🧪 Testar Sessões Numeradas
    </Button>
  );
}