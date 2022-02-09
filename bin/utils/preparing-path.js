const os = require('os');
const { join } = require('path');

exports.preparingPath = (filePath) => {
    const pathToUnixPath = os.platform() === 'win32' ? (str) => str.replace(/\\/g, '/') : (str) => str

    const currentPath = pathToUnixPath(process.cwd());
    return join(currentPath, filePath)
}