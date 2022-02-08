#!/usr/bin/env node

const args = require('args');
const { preparingPath, getFileData } = require('./utils');

const packageLockPath = preparingPath(process.env.PATH_TO_FILE ? process.env.PATH_TO_FILE : '/package-lock.json');

args.options([
    {
        name: 'scope',
        description: 'Package namespace for duplicates search',
    },
])

const { scope } = args.parse(process.argv);

if (!scope) {
    throw new Error('Scope for search duplicates is not defined! Example: package-lock-check-duplicates -s @babel')
}

const lockObject = JSON.parse(getFileData(packageLockPath, 'package-lock'));

function getPackagesByVersion(object, type) {
    const scopePackages = Object.keys(object).filter((pkgName) => pkgName.indexOf(scope) !== -1)
    return scopePackages.reduce((acc, package) => {
        const shortName = package.slice(package.lastIndexOf(scope), package.length)
        const pkg = lockObject[type][package]
        if (pkg.dependencies) {
            const scopeDependencies = Object.keys(pkg.dependencies).filter((pkgName) => pkgName.indexOf(scope) !== -1)
            getPackagesByVersion(scopeDependencies)
        }
        if (pkg.requires) {
            const scopeDependencies = Object.keys(pkg.requires).filter((pkgName) => pkgName.indexOf(scope) !== -1)
            getPackagesByVersion(scopeDependencies)
        }
        const currentVersion = pkg.version
        acc[shortName] = acc[shortName] || []
        if (acc[shortName].indexOf(currentVersion) === -1) {
            acc[shortName].push(currentVersion)
        }
        return acc
    }, {});
}

const packagesByVer = getPackagesByVersion(lockObject.packages, 'packages');
const dependenciesByVer = getPackagesByVersion(lockObject.dependencies, 'dependencies');

const finalListPackages = Object.keys(packagesByVer).reduce((acc, package) => {
    if (packagesByVer[package] && dependenciesByVer[package]) {
        acc[package] = [...packagesByVer[package], ...dependenciesByVer[package].filter(item => packagesByVer[package].indexOf(item) < 0)]
        return acc
    } else {
        acc[package] = packagesByVer[package]
        return acc
    }
}, {});

const pkgWithDuplicates = Object.keys(finalListPackages)
    .filter((name) => packagesByVer[name].length > 1)
    .map((name) => ({ name, versions: packagesByVer[name] }));

if (pkgWithDuplicates.length > 0) {
    console.log(`Packages installed from scope ${scope} has duplicates: `)
    console.log(JSON.stringify(pkgWithDuplicates, undefined, 2))
    process.exit(1)
} else {
    console.log(`Packages installed from scope ${scope} has no duplicates.`)
    process.exit(0)
}
