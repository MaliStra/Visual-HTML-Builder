const { app, BrowserWindow, ipcMain } = require('electron/main')

const windows = []

app.whenReady().then(() => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    titleBarStyle: 'hidden',
    transparent: false,
    resizable: true,
    maximizable: true,
    minimizable: true,
    alwaysOnTop: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: __dirname + '/preload.js'
    }
  })

  windows.push(mainWindow)
  mainWindow.loadFile('index.html')

  // Обработчики для кнопок управления окном
  ipcMain.on('minimize-window', () => {
    mainWindow.minimize()
  })

  ipcMain.on('maximize-window', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })

  ipcMain.on('close-window', () => {
    mainWindow.close()
  })

  ipcMain.on('reload-window', () => {
    mainWindow.reload()
  })

  // Отправляем состояние максимизации в рендерер
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('update-maximize', true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('update-maximize', false)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
