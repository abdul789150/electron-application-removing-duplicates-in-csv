const { app, BrowserWindow } = require('electron')
var dialog = app.dialog
global.ProgressBar = require('electron-progressbar');

// Creating a window for the application
function create_window(){

    // creating the window
    let window = new BrowserWindow({
        width : 1000,
        height : 600,
        minWidth: 1000,
        minHeight: 600,
        webPreferences:{
            nodeIntegration : true
        }
    })

    // and load the index.html of the app.
    // window.loadFile('index.html')
    window.loadURL(`file://${__dirname}/index.html`)

    // Open the DevTools.?
    // window.webContents.openDevTools()
}

// Launching the application when ready
app.whenReady().then(create_window)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        create_window()
    }
})