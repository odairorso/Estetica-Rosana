import { useState, useEffect } from 'react';
import { useAppointments } from "./useAppointments";
import { usePackages } from "./usePackages";

export interface Transaction {
  id: number | string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    type: 'income',
    description: "Serviço: Limpeza de Pele (Ana Silva)",
    amount: 120.00,
    date: "2023-05-15",
    category: "Serviços"
  },
  {
    id: 2,
    type: 'income',
    description: "Pacote: Pacote Limpeza de Pele Premium (Ana Silva)",
    amount: 850.00,
    date: "2023-03-01",
    category: "Pacotes"
  },
  {
    id: 3,
    type: 'expense',
    description: "Compra de materiais",
    amount: 350.00,
    date: "2023-05-01",
    category: "Material"
  },
  {
    id: 4,
    type: 'expense',
    description: "Aluguel",
    amount: 2500.00,
    date: "2023-05-01",
    category: "Fixo"
  }
];

export function useFinance() {
  const { appointments } = useAppointments();
  const { packages } = usePackages();
  const [manualTransactions, setManualTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const storedTransactions = localStorage.getItem('transactions');
      if (storedTransactions) {
        setManualTransactions(JSON.parse(storedTransactions));
      } else {
        setManualTransactions(MOCK_TRANSACTIONS);
        localStorage.setItem('transactions', JSON.stringify(MOCK_TRANSACTIONS));
      }
      setIsLoading(false);
    }, 500);
  }, []);

  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transactionData,
      id: Date.now()
    };
    const updatedTransactions = [...manualTransactions, newTransaction];
    setManualTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    return newTransaction;
  };

  const deleteTransaction = (id: number) => {
    const updatedTransactions = manualTransactions.filter(transaction => transaction.id !== id);
    setManualTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  };

  const incomeFromAppointments = appointments
    .filter(a => a.status === 'concluido')
    .map(a => ({
      id: `apt-${a.id}`,
      type: 'income' as const,
      description: `Serviço: ${a.serviceName} (${a.clientName})`,
      amount: a.price,
      date: a.date,
      category: 'Serviços'
    }));

  const incomeFromPackages = packages.map(p => ({
    id: `pkg-${p.id}`,
    type: 'income' as const,
    description: `Pacote: ${p.name} (${p.clientName})`,
    amount: p.price,
    date: new Date().toISOString().split('T')[0], // Using today's date for demo purposes
    category: 'Pacotes'
  }));

  const allTransactions = [...manualTransactions, ...incomeFromAppointments, ...incomeFromPackages]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getMetrics = () => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const todayIncome = allTransactions
      .filter(t => t.type === 'income' && t.date === today)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthIncome = allTransactions
      .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
      
    const monthExpense = allTransactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingAppointmentsValue = appointments
      .filter(a => a.status === 'agendado' || a.status === 'confirmado')
      .reduce((sum, a) => sum + a.price, 0);

    return {
      todayIncome,
      monthIncome,
      monthExpense,
      monthNetProfit: monthIncome - monthExpense,
      pendingValue: pendingAppointmentsValue,
    };
  };

  return {
    allTransactions,
    isLoading,
    addTransaction,
    deleteTransaction,
    getMetrics,
  };
}