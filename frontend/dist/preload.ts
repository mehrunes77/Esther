import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

/**
 * Preload script - runs before renderer loads
 * Exposes only SAFE APIs to the frontend via context isolation
 */

contextBridge.exposeInMainWorld('estherAPI', {
  // Settings management
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),

  // Planet data
  getPlanetPositions: () => ipcRenderer.invoke('get-planet-positions'),
  getPlanetProfile: (name: string) => ipcRenderer.invoke('get-planet-profile', name),

  // News
  getNews: () => ipcRenderer.invoke('get-news'),

  // Event listeners (renderer can listen, not send raw events)
  onPlanetUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on('planet-update', (_, data) => callback(data));
  },
  onNewsUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on('news-update', (_, data) => callback(data));
  },
});

// TypeScript support
declare global {
  interface Window {
    estherAPI: {
      getSettings: () => Promise<any>;
      saveSettings: (settings: any) => Promise<void>;
      getPlanetPositions: () => Promise<any>;
      getPlanetProfile: (name: string) => Promise<any>;
      getNews: () => Promise<any>;
      onPlanetUpdate: (callback: (data: any) => void) => void;
      onNewsUpdate: (callback: (data: any) => void) => void;
    };
  }
}
