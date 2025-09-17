import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAppointments } from "./useAppointments";
import { usePackages } from "./usePackages";
import { useMemo } from "react";
import { isToday, isThisMonth, parseISO } from "date-fns";

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: string;
}

const fetchTransactions = async () => {
  const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const addTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
  const { data, error } = await supabase.from('transactions').insert([transactionData]).select();
  if (error) throw new Error(error.message);
  return data[0];
};

const deleteTransaction = async (id: string) => {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export function useFinance() {
  const queryClient = useQueryClient();
  const { appointments } = useAppointments();
  const { packages } = usePackages();

  const { data: manualTransactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });

  const addMutation = useMutation({
    mutationFn: addTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const incomeFromAppointments = useMemo(() => {
    return appointments
      .filter(a => a.status === 'concluido')
      .map(a => ({
        id: `apt-${a.id}`,
        type: 'income' as const,
        description: `Serviço: ${a.service_name} (${a.client_name})`,
        amount: a.price,
        date: a.date,
        category: 'Serviços'
      }));
  }, [appointments]);

  const incomeFromPackages = useMemo(() => {
    return packages.map(p => ({
      id: `pkg-${p.id}`,
      type: 'income' as const,
      description: `Pacote: ${p.name} (${p.client_name})`,
      amount: p.price,
      date: p.created_at.split('T')[0],
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
    addTransaction: addMutation.mutate,
    deleteTransaction: deleteMutation.mutate,
    getMetrics,
  };
}