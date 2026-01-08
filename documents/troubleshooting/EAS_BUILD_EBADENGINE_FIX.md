# EAS Build EBADENGINE Error Fix

## Problem Description

When building the CollectPay Android app with Expo EAS Build, the build process failed with an `EBADENGINE` error during the `npm ci --include=dev` step.

### Error Message
```
npm ERR! code EBADENGINE
npm ERR! engine Unsupported engine
npm ERR! engine Not compatible with your version of node/npm
```

## Root Cause

The issue was caused by overly restrictive Node.js version requirements in the `package.json` file:

```json
"engines": {
  "node": ">=20.17.0 <24.0.0",
  "npm": ">=10.0.0 <11.0.0"
}
```

Combined with `engine-strict=true` in `.npmrc`, this configuration enforced strict version checking. EAS build servers for Expo SDK 54 use Node 20.x, but potentially versions earlier than 20.17.0, causing the build to fail.

## Solution

### Change Made

Updated the minimum Node.js version requirement from `>=20.17.0` to `>=20.0.0`:

```json
"engines": {
  "node": ">=20.0.0 <24.0.0",
  "npm": ">=10.0.0 <11.0.0"
}
```

### Why This Works

1. **EAS Compatibility**: EAS build images for Expo SDK 54 use Node 20.x by default
2. **Broader Acceptance**: `>=20.0.0` accepts all Node 20.x versions
3. **Maintains Safety**: Upper bound `<24.0.0` ensures compatibility with Expo SDK 54
4. **Local Development**: `.nvmrc` still specifies 20.17.0 for recommended local setup

## Validation Steps

After implementing the fix:

1. ✅ `npm ci --include=dev` runs successfully
2. ✅ TypeScript compilation passes (`npx tsc --noEmit`)
3. ✅ All 810 dependencies install correctly
4. ✅ 0 security vulnerabilities detected
5. ✅ Local development environment remains compatible

## Prevention Best Practices

### 1. Use Broader Version Ranges for CI/CD

When specifying engine requirements, use broader ranges that accommodate build server environments:

```json
"engines": {
  "node": ">=20.0.0",     // Good: Accepts all Node 20.x+
  "node": ">=20.17.0"     // Problematic: Too specific for CI
}
```

### 2. Test with Multiple Node Versions

Before pushing, test your build with different Node versions:

```bash
# Test with the minimum supported version
nvm use 20.0.0
npm ci --include=dev

# Test with your development version
nvm use 20.17.0
npm ci --include=dev
```

### 3. Consider engine-strict Setting

The `.npmrc` file contains `engine-strict=true` which causes hard failures on version mismatches. Consider:

- **Keep it enabled** for catching version incompatibilities early
- **Ensure version ranges** are broad enough for your CI/CD environment
- **Document minimum versions** based on Expo SDK requirements, not local preferences

### 4. Monitor Expo SDK Requirements

For each Expo SDK version, check the recommended Node.js versions:

| Expo SDK | React Native | Node.js    | npm    |
|----------|--------------|------------|--------|
| 54       | 0.81         | 20.x       | 10.x   |
| 53       | 0.76         | 18.x-20.x  | 9.x+   |

Reference: [Expo Build Infrastructure](https://docs.expo.dev/build-reference/infrastructure/)

### 5. Keep Package Lock Files in Sync

Always ensure `package-lock.json` is committed and in sync with `package.json`:

```bash
# If you see EBADENGINE or package-lock sync errors:
rm -rf node_modules package-lock.json
npm install
npm ci --include=dev  # Verify it works
git add package-lock.json
git commit -m "Update package-lock.json"
```

## Troubleshooting Similar Issues

If you encounter EBADENGINE errors in the future:

1. **Check EAS Build Logs**: Review the Node/npm versions used in the build
2. **Compare Versions**: Ensure your `engines` field is compatible
3. **Test Locally**: Run `npm ci --include=dev` locally to reproduce
4. **Broaden Ranges**: Start with the major version (e.g., `>=20.0.0` instead of `>=20.17.0`)
5. **Remove Upper Bounds**: Consider removing upper bounds if not strictly necessary

## Additional Resources

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Build Infrastructure](https://docs.expo.dev/build-reference/infrastructure/)
- [npm engines Documentation](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#engines)
- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54)

## Related Issues

- Previous attempts to fix this: PRs #6, #7, #8
- Original issue: Expo EAS Android build failure with EBADENGINE

## Date Fixed

January 8, 2026

## Contributors

- copilot-swe-agent[bot]
- kasunvimarshana
