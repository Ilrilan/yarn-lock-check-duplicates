exports.checkDuplications = (target, lockObject, scope) => {
    if (target === 'package') {
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
        const scopePackages = Object.keys(lockObject.object).filter((pkgName) => pkgName.indexOf(scope) !== -1)

        return scopePackages.reduce((acc, package) => {
            const pkgName = package.slice(0, package.lastIndexOf('@'))
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