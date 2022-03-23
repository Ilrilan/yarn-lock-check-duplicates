const os = require('os');
const { join } = require('path');

exports.preparingPath = (target) => {
    const pathToUnixPath = os.platform() === 'win32' ? (str) => str.replace(/\\/g, '/') : (str) => str;
    const currentPath = pathToUnixPath(process.cwd());

    if (target === 'package') {
        return join(currentPath, process.env.PATH_TO_FILE ? process.env.PATH_TO_FILE : '/package-lock.json')
    } else {
        return join(currentPath, process.env.PATH_TO_FILE ? process.env.PATH_TO_FILE : '/yarn.lock')
    }   
}