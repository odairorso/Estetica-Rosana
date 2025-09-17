import { useState, useEffect } from 'react';

export interface ClinicInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface Settings {
  clinicInfo: ClinicInfo;
  theme: 'light' | 'dark' | 'system';
}

const DEFAULT_SETTINGS: Settings = {
  clinicInfo: {
    name: "Clínica Rosana Turci",
    phone: "(11) 99999-9999",
    email: "contato@rosanaturci.com.br",
    address: "Rua das Flores, 123 - Centro, São Paulo - SP"
  },
  theme: 'dark'
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const storedSettings = localStorage.getItem('settings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        setSettings(DEFAULT_SETTINGS);
        localStorage.setItem('settings', JSON.stringify(DEFAULT_SETTINGS));
      }
      setIsLoading(false);
    }, 500);
  }, []);

  const updateClinicInfo = (info: Partial<ClinicInfo>) => {
    const updatedSettings = {
      ...settings,
      clinicInfo: { ...settings.clinicInfo, ...info }
    };
    setSettings(updatedSettings);
    localStorage.setItem('settings', JSON.stringify(updatedSettings));
  };

  const updateTheme = (theme: 'light' | 'dark' | 'system') => {
    const updatedSettings = { ...settings, theme };
    setSettings(updatedSettings);
    localStorage.setItem('settings', JSON.stringify(updatedSettings));
  };

  return {
    settings,
    isLoading,
    updateClinicInfo,
    updateTheme
  };
}