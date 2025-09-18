import { useState, useEffect } from 'react';
import { useAppointments } from "./useAppointments";
import { usePackages } from "./usePackages";
import { useSales } from "./useSales";
import { useMemo } from "react";
import { isToday, isThisMonth, parseISO } from "date-fns";

export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string; // Formato brasileiro: DD/MM/YYYY
  category: string;
}

const TRANSACTIONS_STORAGE_KEY = 'clinic-transactions';

export function useFinance() {
  const [manualTransactions, setManualTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { appointments } = useAppointments();
  const { packages } = usePackages();
  const { sales } = useSales();

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
              date: "10/05/2023",
              category: "Material"
            },
            {
              id: 2,
              type: 'expense',
              description: "Pagamento de aluguel",
              amount: 2500.00,
              date: "01/05/2023",
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
    console.log("📅 Processando agendamentos concluídos para finanças:", appointments.filter(a => a.status === 'concluido'));
    return appointments
      .filter(a => a.status === 'concluido')
      .map(a => {
        const appointmentDate = a.appointment_date ? new Date(a.appointment_date).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
        return {
          id: a.id * 1000, // Different ID space to avoid conflicts
          type: 'income' as const,
          description: `Serviço: ${a.service_name || a.package_name || 'Serviço'} (${a.client_name})`,
          amount: a.price || 0,
          date: appointmentDate,
          category: 'Serviços'
        };
      });
  }, [appointments]);

  const incomeFromPackages = useMemo(() => {
    console.log("📦 Processando pacotes para finanças:", packages);
    return packages
      .filter(p => p.status === 'active' || p.status === 'completed') // Apenas pacotes vendidos
      .map(p => {
        const packageDate = p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
        console.log(`📅 Pacote ${p.id}: ${p.name} (${p.clientName}) - R$ ${p.price} - ${packageDate}`);
        return {
          id: p.id * 10000, // Different ID space to avoid conflicts
          type: 'income' as const,
          description: `Pacote: ${p.name} (${p.clientName || 'Cliente'})`,
          amount: p.price || 0,
          date: packageDate,
          category: 'Pacotes'
        };
      });
  }, [packages]);

  const incomeFromSales = useMemo(() => {
    console.log("💰 Processando vendas do caixa para finanças:", sales);
    return sales.map(sale => {
      const saleDate = sale.sale_date ? new Date(sale.sale_date).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
      console.log(`📅 Venda ${sale.id}: ${sale.clientName} - R$ ${sale.total} - ${saleDate}`);
      return {
        id: sale.id * 100000, // Different ID space to avoid conflicts
        type: 'income' as const,
        description: `Venda Caixa: ${sale.clientName}`,
        amount: sale.total || 0,
        date: saleDate,
        category: 'Vendas Caixa'
      };
    });
  }, [sales]); // AGORA ESCUTA MUDANÇAS NAS VENDAS!

  const allTransactions = useMemo(() => {
    const all = [...manualTransactions, ...incomeFromAppointments, ...incomeFromPackages, ...incomeFromSales];
    return all.sort((a, b) => {
      // Converter datas brasileiras para comparação
      const dateA = a.date ? new Date(a.date.split('/').reverse().join('-')) : new Date(0);
      const dateB = b.date ? new Date(b.date.split('/').reverse().join('-')) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [manualTransactions, incomeFromAppointments, incomeFromPackages, incomeFromSales]);

  const getMetrics = () => {
    const today = new Date().toLocaleDateString('pt-BR');
    
    const todayIncome = allTransactions
      .filter(t => t.type === 'income' && t.date === today)
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthIncome = allTransactions
      .filter(t => {
        if (t.type !== 'income' || !t.date) return false;
        const [day, month, year] = t.date.split('/').map(Number);
        return month === currentMonth + 1 && year === currentYear;
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);
      
    const monthExpense = allTransactions
      .filter(t => {
        if (t.type !== 'expense' || !t.date) return false;
        const [day, month, year] = t.date.split('/').map(Number);
        return month === currentMonth + 1 && year === currentYear;
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const pendingAppointmentsValue = appointments
      .filter(a => a.status === 'agendado' || a.status === 'confirmado')
      .reduce((sum, a) => sum + (a.price || 0), 0);

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