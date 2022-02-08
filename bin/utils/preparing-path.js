const os = require('os')

exports.preparingPath = (filePath) => {
    const pathToUnixPath = os.platform() === 'win32' ? (str) => str.replace(/\\/g, '/') : (str) => str

    const currentPath = pathToUnixPath(process.cwd())
    return currentPath + filePath
}