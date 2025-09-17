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

const SETTINGS_STORAGE_KEY = 'clinic-settings';

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          const parsedSettings = JSON.parse(stored);
          // Ensure clinicInfo exists even if partially saved
          if (!parsedSettings.clinicInfo) {
            parsedSettings.clinicInfo = {
              name: "",
              phone: "",
              email: "",
              address: ""
            };
          }
          setSettings(parsedSettings);
        } else {
          // Initialize with default settings
          const defaultSettings: Settings = {
            clinicInfo: {
              name: "Clínica Rosana Turci",
              phone: "(11) 99999-9999",
              email: "contato@rosanaturci.com.br",
              address: "Rua Exemplo, 123 - Centro, São Paulo - SP"
            },
            theme: 'dark'
          };
          setSettings(defaultSettings);
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        // Fallback to default settings if there's an error
        const defaultSettings: Settings = {
          clinicInfo: {
            name: "Clínica Rosana Turci",
            phone: "(11) 99999-9999",
            email: "contato@rosanaturci.com.br",
            address: "Rua Exemplo, 123 - Centro, São Paulo - SP"
          },
          theme: 'dark'
        };
        setSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (settings) {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    }
  }, [settings]);

  const updateClinicInfo = (info: Partial<ClinicInfo>) => {
    if (settings) {
      setSettings({
        ...settings,
        clinicInfo: { ...settings.clinicInfo, ...info }
      });
    }
  };

  const updateTheme = (theme: 'light' | 'dark' | 'system') => {
    if (settings) {
      setSettings({
        ...settings,
        theme
      });
    }
  };

  return {
    settings: settings || {
      clinicInfo: {
        name: "Clínica Rosana Turci",
        phone: "(11) 99999-9999",
        email: "contato@rosanaturci.com.br",
        address: "Rua Exemplo, 123 - Centro, São Paulo - SP"
      },
      theme: 'dark'
    }, // Fallback to default settings if null
    isLoading,
    updateClinicInfo,
    updateTheme
  };
}