"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    getUsageData: () => electron_1.ipcRenderer.invoke('get-usage-data'),
    onUsageUpdate: (callback) => {
        electron_1.ipcRenderer.on('usage-update', (_event, data) => callback(data));
    },
    quit: () => electron_1.ipcRenderer.invoke('quit-app')
});
