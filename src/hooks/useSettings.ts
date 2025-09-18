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

<<<<<<< HEAD
const defaultSettings: Settings = {
  clinicInfo: {
    name: "Clínica Rosana Turci",
    phone: "(11) 99999-9999",
    email: "contato@rosanaturci.com.br",
    address: "Rua Exemplo, 123 - Centro, São Paulo - SP"
  },
  theme: 'dark'
};

=======
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
<<<<<<< HEAD
          const parsedSettings = JSON.parse(stored);
          // Ensure clinicInfo exists even if partially saved
          if (!parsedSettings.clinicInfo) {
            parsedSettings.clinicInfo = defaultSettings.clinicInfo;
          }
          setSettings(parsedSettings);
        } else {
          // Initialize with default settings
=======
          setSettings(JSON.parse(stored));
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
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
          setSettings(defaultSettings);
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
<<<<<<< HEAD
        // Fallback to default settings if there's an error
        setSettings(defaultSettings);
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
=======
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (settings) {
<<<<<<< HEAD
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Error saving settings:', error);
      }
=======
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
    }
  }, [settings]);

  const updateClinicInfo = (info: Partial<ClinicInfo>) => {
<<<<<<< HEAD
    setSettings(prev => {
      if (!prev) return defaultSettings;
      
      const newSettings = {
        ...prev,
        clinicInfo: { ...prev.clinicInfo, ...info }
      };
      
      // Salvar imediatamente no localStorage
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      } catch (error) {
        console.error('Error saving settings:', error);
      }
      
      return newSettings;
    });
  };

  const updateTheme = (theme: 'light' | 'dark' | 'system') => {
    setSettings(prev => {
      if (!prev) return { ...defaultSettings, theme };
      
      const newSettings = { ...prev, theme };
      
      // Salvar imediatamente no localStorage
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      } catch (error) {
        console.error('Error saving settings:', error);
      }
      
      return newSettings;
    });
  };

  // Garantir que sempre retornamos valores válidos
  const safeSettings = settings || defaultSettings;

  return {
    settings: safeSettings,
=======
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
    settings,
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
    isLoading,
    updateClinicInfo,
    updateTheme
  };
}