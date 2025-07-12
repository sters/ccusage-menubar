import { app, ipcMain } from 'electron'
import { menubar } from 'menubar'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { usageService } from './services/usageService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mb: ReturnType<typeof menubar>

app.whenReady().then(() => {
  // Get the correct path to the icon based on environment
  const assetsPath = path.join(__dirname, '../assets')
  
  // Use template icon for macOS
  const iconName = 'icon.png'
  const iconPath = path.join(assetsPath, iconName)
  
  console.log('Icon path:', iconPath)
  console.log('Icon exists:', fs.existsSync(iconPath))
  
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
      // Keep window open when clicking outside
      alwaysOnTop: true,
      show: false,
      skipTaskbar: true,
      hiddenInMissionControl: true
    },
    // For macOS, we need to specify that this should show in dock
    showDockIcon: false,
    // Disable auto-hide when window loses focus
    showOnAllWorkspaces: false,
    preloadWindow: true
  })

  mb.on('ready', () => {
    console.log('Menubar app is ready')
    console.log('Tray bounds:', mb.tray.getBounds())
  })
  
  mb.on('show', () => {
    console.log('Menubar window shown')
  })
  
  mb.on('hide', () => {
    console.log('Menubar window hidden')
  })

  mb.on('after-create-window', () => {
    if (process.env.NODE_ENV === 'development' && process.env.OPEN_DEVTOOLS === 'true') {
      mb.window?.webContents.openDevTools({ mode: 'detach' })
    }
    
    // Override blur behavior to prevent hiding
    mb.window?.on('blur', () => {
      // Do nothing - keep window open
    })
  })
})

ipcMain.handle('get-usage-data', async () => {
  const usageData = await usageService.fetchUsageData()
  
  // Transform the data to match the expected format
  return {
    tokens: {
      input: usageData.today.inputTokens,
      output: usageData.today.outputTokens,
      cacheCreation: usageData.today.cacheCreationTokens || 0,
      cacheRead: usageData.today.cacheReadTokens || 0
    },
    estimatedCost: usageData.today.totalCost,
    modelsUsed: usageData.today.modelsUsed,
    daily: usageData.daily
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
