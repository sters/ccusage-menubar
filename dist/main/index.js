import { app, ipcMain } from 'electron';
import { menubar } from 'menubar';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { usageService } from './services/usageService.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let mb;
let backgroundRefreshInterval = null;
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
app.whenReady().then(() => {
    // Get the correct path to the icon based on environment
    const assetsPath = path.join(__dirname, '../assets');
    // Use template icon for macOS
    const iconName = 'iconTemplate.png';
    const iconPath = path.join(assetsPath, iconName);
    mb = menubar({
        icon: iconPath,
        tooltip: 'Claude Code Usage',
        index: process.env.NODE_ENV === 'development'
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../renderer/index.html')}`,
        browserWindow: {
            width: 400,
            height: 600,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js')
            },
            alwaysOnTop: false,
            show: false,
            skipTaskbar: true,
            hiddenInMissionControl: true
        },
        // For macOS, we need to specify that this should show in dock
        showDockIcon: false,
        // Disable auto-hide when window loses focus
        showOnAllWorkspaces: false,
        preloadWindow: true
    });
    mb.on('ready', () => {
        // Start background refresh when app is ready
        startBackgroundRefresh();
    });
    mb.on('show', () => {
    });
    mb.on('hide', () => {
        // Window hidden
    });
    mb.on('after-create-window', () => {
        if (process.env.NODE_ENV === 'development' && process.env.OPEN_DEVTOOLS === 'true') {
            mb.window?.webContents.openDevTools({ mode: 'detach' });
        }
        // Hide window when it loses focus
        mb.window?.on('blur', () => {
            mb.hideWindow();
        });
    });
});
// Function to fetch and emit usage data updates
async function fetchAndEmitUsageData() {
    const usageData = await usageService.fetchUsageData();
    const formattedData = {
        tokens: {
            input: usageData.today.inputTokens,
            output: usageData.today.outputTokens,
            cacheCreation: usageData.today.cacheCreationTokens || 0,
            cacheRead: usageData.today.cacheReadTokens || 0
        },
        estimatedCost: usageData.today.totalCost,
        modelsUsed: usageData.today.modelsUsed,
        daily: usageData.daily
    };
    // Emit the update to the renderer if window exists
    if (mb.window) {
        mb.window.webContents.send('usage-update', formattedData);
    }
    return formattedData;
}
// Start background refresh when app is ready
function startBackgroundRefresh() {
    // Initial fetch
    fetchAndEmitUsageData().catch(() => { });
    // Clear any existing interval
    if (backgroundRefreshInterval) {
        clearInterval(backgroundRefreshInterval);
    }
    // Set up periodic refresh
    backgroundRefreshInterval = setInterval(() => {
        fetchAndEmitUsageData().catch(() => { });
    }, REFRESH_INTERVAL);
}
// Stop background refresh
function stopBackgroundRefresh() {
    if (backgroundRefreshInterval) {
        clearInterval(backgroundRefreshInterval);
        backgroundRefreshInterval = null;
    }
}
ipcMain.handle('get-usage-data', async () => {
    return fetchAndEmitUsageData();
});
ipcMain.handle('quit-app', () => {
    app.quit();
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('before-quit', () => {
    stopBackgroundRefresh();
});
