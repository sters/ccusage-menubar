import { app, ipcMain } from 'electron'
import { menubar } from 'menubar'
import path from 'path'

let mb: ReturnType<typeof menubar>

app.whenReady().then(() => {
  // Get the correct path to the icon based on environment
  const assetsPath = process.env.NODE_ENV === 'development'
    ? path.join(__dirname, '../../assets')
    : path.join(__dirname, '../assets')
  
  // Use template icon for macOS
  const iconName = process.platform === 'darwin' ? 'iconTemplate.png' : 'icon.png'
  const iconPath = path.join(assetsPath, iconName)
  
  console.log('Icon path:', iconPath)
  console.log('Icon exists:', require('fs').existsSync(iconPath))
  
  mb = menubar({
    index: process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../renderer/index.html')}`,
    icon: iconPath,
    tooltip: 'Claude Code Usage',
    browserWindow: {
      width: 400,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    },
    // For macOS, we need to specify that this should show in dock
    showDockIcon: false,
    showOnAllWorkspaces: false
  })

  mb.on('ready', () => {
    console.log('Menubar app is ready')
  })

  mb.on('after-create-window', () => {
    if (process.env.NODE_ENV === 'development') {
      mb.window?.webContents.openDevTools({ mode: 'detach' })
    }
  })
})

ipcMain.handle('get-usage-data', async () => {
  // TODO: Implement ccusage integration
  return {
    tokens: {
      input: 1234,
      output: 5678,
      total: 6912
    },
    requests: 42,
    estimatedCost: 1.23
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
