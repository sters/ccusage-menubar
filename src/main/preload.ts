import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getUsageData: () => ipcRenderer.invoke('get-usage-data'),
  onUsageUpdate: (callback: (data: unknown) => void) => {
    ipcRenderer.on('usage-update', (_event, data) => callback(data))
  }
})