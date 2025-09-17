import { useState, useEffect } from 'react';
import { useAppointments } from "./useAppointments";
import { usePackages } from "./usePackages";
import { useMemo } from "react";
import { isToday, isThisMonth, parseISO } from "date-fns";

export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: string;
}

const TRANSACTIONS_STORAGE_KEY = 'clinic-transactions';

export function useFinance() {
  const [manualTransactions, setManualTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { appointments } = useAppointments();
  const { packages } = usePackages();

  // Load transactions from localStorage on mount
  useEffect(() => {
    const loadTransactions = () => {
      try {
        const stored = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
        if (stored) {
          setManualTransactions(JSON.parse(stored));
        } else {
          // Initialize with sample data if empty
          const sampleTransactions: Transaction[] = [
            {
              id: 1,
              type: 'expense',
              description: "Compra de material para procedimentos",
              amount: 350.00,
              date: "2023-05-10",
              category: "Material"
            },
            {
              id: 2,
              type: 'expense',
              description: "Pagamento de aluguel",
              amount: 2500.00,
              date: "2023-05-01",
              category: "Aluguel"
            }
          ];
          setManualTransactions(sampleTransactions);
          localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(sampleTransactions));
        }
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(manualTransactions));
  }, [manualTransactions]);

  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Math.max(0, ...manualTransactions.map(t => t.id)) + 1
    };
    setManualTransactions([...manualTransactions, newTransaction]);
    return newTransaction;
  };

  const deleteTransaction = (id: number) => {
    setManualTransactions(manualTransactions.filter(transaction => transaction.id !== id));
  };

  const incomeFromAppointments = useMemo(() => {
    return appointments
      .filter(a => a.status === 'concluido')
      .map(a => ({
        id: a.id * 1000, // Different ID space to avoid conflicts
        type: 'income' as const,
        description: `Serviço: ${a.serviceName} (${a.clientName})`,
        amount: a.price,
        date: a.date,
        category: 'Serviços'
      }));
  }, [appointments]);

  const incomeFromPackages = useMemo(() => {
    return packages.map(p => ({
      id: p.id * 10000, // Different ID space to avoid conflicts
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