#!/usr/bin/env node

const args = require('args')
const lockfile = require('@yarnpkg/lockfile')
const { preparingPath, getFileData } = require('./utils');

const yarnLockPath = preparingPath(process.env.PATH_TO_FILE ? process.env.PATH_TO_FILE : '/yarn.lock')

args.options([
    {
        name: 'scope',
        description: 'Package namespace for duplicates search',
    },
])

const { scope } = args.parse(process.argv)

if (!scope) {
    throw new Error('Scope for search duplicates is not defined! Example: yarn-lock-check-duplicates -s @babel')
}

const yarnLockObject = lockfile.parse(getFileData(yarnLockPath, 'yarn.lock'))

const scopePackages = Object.keys(yarnLockObject.object).filter((pkgName) => pkgName.indexOf(scope) !== -1)

const packagesByVer = scopePackages.reduce((acc, package) => {
    const pkgName = package.slice(0, package.lastIndexOf('@'))
    const pkg = yarnLockObject.object[package]
    const currentVersion = pkg.version
    acc[pkgName] = acc[pkgName] || []
    if (acc[pkgName].indexOf(currentVersion) === -1) {
        acc[pkgName].push(currentVersion)
    }
    return acc
}, {});

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
