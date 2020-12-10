#!/usr/bin/env node

const args = require('args')
const lockfile = require('@yarnpkg/lockfile')
const fs = require('fs')
const os = require('os')

const pathToUnixPath = os.platform() === 'win32' ? (str) => str.replace(/\\/g, '/') : (str) => str

const currentPath = pathToUnixPath(process.cwd())
const yarnLockPath = currentPath + '/yarn.lock'

args.options([
    {
        name: 'scope',
        description: 'Package namespace for duplicates search',
    },
])

const { scope } = args.parse(process.argv)

const yarnLockExists = fs.existsSync(yarnLockPath)

if (!yarnLockExists) {
    throw new Error(`Can't find "yarn.lock" file in ${yarnLockPath}`)
}

const yarnLockObject = lockfile.parse(fs.readFileSync(yarnLockPath, 'utf8'))

const skopePackages = Object.keys(yarnLockObject.object).filter((pkgName) => pkgName.indexOf(scope) !== -1)

const packagesByVer = {}

for (let i = 0; i < skopePackages.length; i++) {
    const pkgName = skopePackages[i].slice(0, skopePackages[i].lastIndexOf('@'))
    const yarnPkg = yarnLockObject.object[skopePackages[i]]
    const currentVersion = yarnPkg.version
    packagesByVer[pkgName] = packagesByVer[pkgName] || []
    if (packagesByVer[pkgName].indexOf(currentVersion) === -1) {
        packagesByVer[pkgName].push(currentVersion)
    }
}

const pkgWithDuplicates = Object.keys(packagesByVer)
    .filter((name) => packagesByVer[name].length > 1)
    .map((name) => ({ name, versions: packagesByVer[name] }))

if (pkgWithDuplicates.length > 0) {
    console.log(`Packages installed from scope ${scope} has duplicates: `)
    console.log(JSON.stringify(pkgWithDuplicates, undefined, 2))
    process.exit(1)
} else {
    console.log(`Packages installed from scope ${scope} has no duplicates.`)
    process.exit(0)
}
