This small utility can check the `yarn.lock` file for having the same versions of one package.

Example:

For check yarn.lock file: `yarn check-duplicates -s @babel -t yarn`.

For check package-lock.json file: `yarn check-duplicates -s @babel -t package`.

If `yarn.lock` file has more than one version of any babel package, you'll receive exitCode=1 and see something like this:

```
Packages installed from scope @babel have duplicates:
...
```

If there isn't problems with package versions, you'll see

```
Packages installed from scope @babel have no duplicates.
...
```
