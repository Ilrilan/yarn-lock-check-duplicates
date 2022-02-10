const fs = require('fs');
const path = require('path');
const lockfile = require('@yarnpkg/lockfile');

exports.getFileData = (filePath, target) => {
    const lockExists = fs.existsSync(filePath);
    const fileName = path.basename(filePath);
   
    if (!lockExists) {
        throw new Error(`Can't find "${fileName}" file in ${filePath}`)
    }

    const fileDate = fs.readFileSync(filePath, 'utf8');

    return target === 'package' ? JSON.parse(fileDate) : lockfile.parse(fileDate)
}