function checkByConstraints(pkgName, scope, exclude) {
    return pkgName.indexOf(scope) !== -1 && (!exclude || !exclude.some(function(e) {
        // handle @somescope/pkgname as in yarn.lock
        if (pkgName.indexOf('node_modules') !== 0) {
            return e === pkgName
        }
        const excludeWithNm = 'node_modules/' + e
        const excInd = pkgName.indexOf(excludeWithNm)
        // handle name kind of node_modules/@somescope/pkgname from package-lock.json of version 2+ 
        return excInd !== -1 && (excludeWithNm.length + excInd) === pkgName.length
    }))
}

function pkgSpecifierToPkgName(pkgSpecifier) {
    return pkgSpecifier.slice(0, pkgSpecifier.lastIndexOf('@'))
}

exports.checkDuplications = (target, lockObject, scope, exclude) => {
    if (target === 'package') {
        function getPackagesByVersion(object, type) {
            const scopePackages = Object.keys(object).filter((pkgName) => checkByConstraints(pkgName, scope, exclude))
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

        return Object.keys(packagesByVer).reduce((acc, package) => {
            if (packagesByVer[package] && dependenciesByVer[package]) {
                acc[package] = [...packagesByVer[package], ...dependenciesByVer[package].filter(item => packagesByVer[package].indexOf(item) < 0)]
                return acc
            } else {
                acc[package] = packagesByVer[package]
                return acc
            }
        }, {});
    } else {
        const scopePackages = Object.keys(lockObject.object).filter((pkgSpecifier) => checkByConstraints(pkgSpecifierToPkgName(pkgSpecifier), scope, exclude))

        return scopePackages.reduce((acc, package) => {
            const pkgName = pkgSpecifierToPkgName(package)
            const pkg = lockObject.object[package]
            const currentVersion = pkg.version
            acc[pkgName] = acc[pkgName] || []
            if (acc[pkgName].indexOf(currentVersion) === -1) {
                acc[pkgName].push(currentVersion)
            }
            return acc
        }, {});
    }
}   