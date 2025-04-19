import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
      textAreasAreResizable: false,
    },
  });
  app.on('quit', (electronEvent, exitCode) => {
    if (exitCode !== 0)
      app.relaunch()
  })
  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
  win.removeMenu()
  if(import.meta.env.MODE === 'development' || import.meta.env.DEV) {
    console.log(JSON.stringify({import:{meta:{env:import.meta.env}}}, null, '  '))
    // if we're running in dev mode, let's use the devtools
    // Open the DevTools.
    win.webContents.openDevTools({ mode: 'detach' });
    // this is to avoid errors because of autofill
    try {
      win.webContents.debugger.removeAllListeners('Autofill.enable');
    } catch { /* empty */ }
    try {
      win.webContents.debugger.removeAllListeners('Autofill.setAddresses');
    } catch { /* empty */ }
  } else {
    // if were not in development mode, jump into kiosk mode
    win.setKiosk(true)
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
