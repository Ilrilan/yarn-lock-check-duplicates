const fs = require('fs')

exports.getFileData = (filePath, fileName) => {
    const lockExists = fs.existsSync(filePath)

    if (!lockExists) {
        throw new Error(`Can't find "${fileName}" file in ${filePath}`)
    }

    return fs.readFileSync(filePath, 'utf8')
}