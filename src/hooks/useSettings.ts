import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ClinicInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface Settings {
  clinic_info: ClinicInfo;
  theme: 'light' | 'dark' | 'system';
}

const fetchSettings = async () => {
  const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
  if (error) throw new Error(error.message);
  return data;
};

const updateSettings = async (settingsData: Partial<Settings>) => {
  const { data, error } = await supabase.from('settings').update(settingsData).eq('id', 1).select();
  if (error) throw new Error(error.message);
  return data[0];
};

export function useSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  });

  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const updateClinicInfo = (info: Partial<ClinicInfo>) => {
    if (settings) {
      updateMutation.mutate({
        clinic_info: { ...settings.clinic_info, ...info }
      });
    }
  };

  const updateTheme = (theme: 'light' | 'dark' | 'system') => {
    updateMutation.mutate({ theme });
  };

  return {
    settings,
    isLoading,
    updateClinicInfo,
    updateTheme
  };
}