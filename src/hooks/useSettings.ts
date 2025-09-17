import { useState, useEffect } from "react";

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

const STORAGE_KEY = "clinic-settings";

const initialSettings: Settings = {
  clinicInfo: {
    name: "Rosana Turci Estética",
    phone: "(11) 98765-4321",
    email: "contato@rosanaturci.com",
    address: "Av. Paulista, 1234, São Paulo - SP"
  },
  theme: 'dark'
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialSettings;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateClinicInfo = (info: Partial<ClinicInfo>) => {
    setSettings(prev => ({
      ...prev,
      clinicInfo: { ...prev.clinicInfo, ...info }
    }));
  };

  const updateTheme = (theme: 'light' | 'dark' | 'system') => {
    setSettings(prev => ({ ...prev, theme }));
  };

  return {
    settings,
    updateClinicInfo,
    updateTheme
  };
}