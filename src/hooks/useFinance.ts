import { useState, useEffect, useMemo } from "react";
import { useAppointments } from "./useAppointments";
import { usePackages } from "./usePackages";
import { isToday, isThisMonth, parseISO } from "date-fns";

export interface Transaction {
  id: number | string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: string;
}

const STORAGE_KEY = "clinic-transactions";

const initialTransactions: Transaction[] = [
  {
    id: 1,
    type: 'expense',
    description: 'Aluguel do espaço',
    amount: 2500,
    date: new Date(new Date().setDate(5)).toISOString().split('T')[0],
    category: 'Infraestrutura'
  },
  {
    id: 2,
    type: 'expense',
    description: 'Compra de material',
    amount: 800,
    date: new Date(new Date().setDate(2)).toISOString().split('T')[0],
    category: 'Estoque'
  }
];

export function useFinance() {
  const { appointments } = useAppointments();
  const { packages } = usePackages();

  const [manualTransactions, setManualTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialTransactions;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(manualTransactions));
  }, [manualTransactions]);

  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now(),
    };
    setManualTransactions(prev => [...prev, newTransaction]);
  };

  const deleteTransaction = (id: number) => {
    setManualTransactions(prev => prev.filter(t => t.id !== id));
  };

  const incomeFromAppointments = useMemo(() => {
    return appointments
      .filter(a => a.status === 'concluido')
      .map(a => ({
        id: `apt-${a.id}`,
        type: 'income' as const,
        description: `Serviço: ${a.serviceName} (${a.clientName})`,
        amount: a.price,
        date: a.date.toISOString().split('T')[0],
        category: 'Serviços'
      }));
  }, [appointments]);

  const incomeFromPackages = useMemo(() => {
    // Assuming payment is made when the package is created
    return packages.map(p => ({
      id: `pkg-${p.id}`,
      type: 'income' as const,
      description: `Pacote: ${p.name} (${p.clientName})`,
      amount: p.price,
      date: p.createdAt,
      category: 'Pacotes'
    }));
  }, [packages]);

  const allTransactions = useMemo(() => {
    const all = [...manualTransactions, ...incomeFromAppointments, ...incomeFromPackages];
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [manualTransactions, incomeFromAppointments, incomeFromPackages]);

  const getMetrics = () => {
    const todayIncome = allTransactions
      .filter(t => t.type === 'income' && isToday(parseISO(t.date)))
      .reduce((sum, t) => sum + t.amount, 0);

    const monthIncome = allTransactions
      .filter(t => t.type === 'income' && isThisMonth(parseISO(t.date)))
      .reduce((sum, t) => sum + t.amount, 0);
      
    const monthExpense = allTransactions
      .filter(t => t.type === 'expense' && isThisMonth(parseISO(t.date)))
      .reduce((sum, t) => sum + t.amount, 0);

    // "A Receber" is a bit tricky without payment status. For now, let's assume all confirmed/scheduled appointments are pending payment.
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
    addTransaction,
    deleteTransaction,
    getMetrics,
  };
}