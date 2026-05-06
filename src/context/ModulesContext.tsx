'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface Module {
  id: number;
  moduleKey: string;
  moduleName: string;
  isEnabled: boolean;
}

interface ModulesContextType {
  modules: Module[];
  loading: boolean;
  isEnabled: (key: string) => boolean;
  toggleModule: (key: string, enabled: boolean) => Promise<void>;
  refresh: () => Promise<void>;
}

const ModulesContext = createContext<ModulesContextType>({
  modules: [],
  loading: true,
  isEnabled: () => false,
  toggleModule: async () => {},
  refresh: async () => {},
});

export function useModules() {
  return useContext(ModulesContext);
}

export function ModulesProvider({ children }: { children: React.ReactNode }) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await fetch('/api/organization/modules');
      if (res.ok) {
        const data = await res.json();
        setModules(data);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const isEnabled = (key: string) => {
    const m = modules.find(m => m.moduleKey === key);
    return m ? m.isEnabled : false;
  };

  const toggleModule = async (key: string, enabled: boolean) => {
    await fetch(`/api/organization/modules/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isEnabled: enabled }),
    });
    await refresh();
  };

  return (
    <ModulesContext.Provider value={{ modules, loading, isEnabled, toggleModule, refresh }}>
      {children}
    </ModulesContext.Provider>
  );
}
