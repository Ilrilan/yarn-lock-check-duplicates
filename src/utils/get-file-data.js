const fs = require('fs');
const path = require('path');
const lockfile = require('@yarnpkg/lockfile');
const { preparingPath } = require('./preparing-path');

exports.getFileData = (target) => {
    const packageLockPath = preparingPath(target);
    const lockExists = fs.existsSync(packageLockPath);
    const fileName = path.basename(packageLockPath);

    if (!lockExists) {
        throw new Error(`Can't find "${fileName}" file in ${packageLockPath}`)
    }

    const fileDate = fs.readFileSync(packageLockPath, 'utf8');

    return target === 'package' ? JSON.parse(fileDate) : lockfile.parse(fileDate)
}