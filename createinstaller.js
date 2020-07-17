const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
  .then(createWindowsInstaller)
  .catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })

function getInstallerConfig () {
  console.log('creating windows installer')
  const rootPath = path.join('./')
  const outPath = path.join(rootPath, 'win_build')
  
  return Promise.resolve({
    appDirectory: path.join(outPath, 'File Agency-win32-x64/'),
    noMsi: true,
    outputDirectory: path.join(outPath, 'windows-installer'),
    authors: 'AbdulRehman',
    description: "Keysy application",
    exe: 'File Agency.exe',
    setupExe: 'Keysy.exe',
    setupIcon: path.join(rootPath, 'assets', 'icon','logo.ico')
  })
}