#!/usr/bin/env node

const args = require('args');
const { getFileData } = require('../src/utils');
const { checkDuplications } = require('../src/check-duplications');

const ALLOWED_TARGET_TYPES = ['package', 'yarn'];

args.options([
    {
        name: 'scope',
        description: 'Package namespace for duplicates search',
    },
    {
        name: 'target',
        description: 'The type of file in which duplicates will be searched'
    }
])

const { scope, target } = args.parse(process.argv);

if (!scope) {
    throw new Error('Scope for search duplicates is not defined! Example: check-duplicates -s @babel');
}

if (!target) {
    throw new Error('The target file for searching for duplicates is not defined! Example: check-duplicates -t package');
}

if (!ALLOWED_TARGET_TYPES.some(allowedTarget => target === allowedTarget)) {
    throw new Error(`The target file can only be of two types - package or yarn! "${target}" is not allowed`)
}

const lockObject = getFileData(target);
const finalListPackages = checkDuplications(target, lockObject, scope);

const pkgWithDuplicates = Object.keys(finalListPackages)
    .filter((name) => finalListPackages[name].length > 1)
    .map((name) => ({ name, versions: finalListPackages[name] }))

if (pkgWithDuplicates.length > 0) {
    console.log(`Packages installed from scope ${scope} has duplicates: `)
    console.log(JSON.stringify(pkgWithDuplicates, undefined, 2))
    process.exit(1)
} else {
    console.log(`Packages installed from scope ${scope} has no duplicates.`)
    process.exit(0)
}