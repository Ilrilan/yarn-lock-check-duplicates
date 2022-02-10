This small utility can check `yarn.lock` file for having same versions of one package.

Example:

`yarn check-duplicates -s @babel -t package`

If `yarn.lock` file has more than one version of any babel package, you'll receive exitCode=1 and see something like this:

```
Packages installed from scope @babel has duplicates:
...
```

If there isn't problems with package versions, you'll see

```
Packages installed from scope @babel has no duplicates.
...
```
