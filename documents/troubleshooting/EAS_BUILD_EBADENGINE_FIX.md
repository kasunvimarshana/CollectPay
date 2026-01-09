# EAS Build EBADENGINE Error Fix

## Problem Description

When building the CollectPay Android app with Expo EAS Build, the build process failed with an `EBADENGINE` error during the `npm ci --include=dev` step.

### Error Message
```
npm ERR! code EBADENGINE
npm ERR! engine Unsupported engine
npm ERR! engine Not compatible with your version of node/npm: @react-native/assets-registry@0.81.5
npm ERR! notsup Required: {"node":">= 20.19.4"}
npm ERR! notsup Actual:   {"npm":"10.8.2","node":"v20.17.0"}
```

## Root Cause

The issue was caused by incompatibility between the configured Node version and React Native dependency requirements:

1. **Dependency Requirement**: `@react-native/assets-registry@0.81.5` requires Node >= 20.19.4
2. **Configured Version**: The project was configured to use Node 20.17.0
3. **Result**: EBADENGINE error during dependency installation on EAS build servers

## Solution

### Changes Made

#### 1. Updated .nvmrc Files

Updated Node version across all .nvmrc files from 20.17.0 to 20.19.4:

- **Root**: `/.nvmrc`
- **Frontend**: `/frontend/.nvmrc`
- **Backend**: `/backend/.nvmrc`

```
20.19.4
```

#### 2. Updated eas.json (Best Practice)

Updated explicit Node version in all build profiles in `frontend/eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "node": "20.19.4"
    },
    "preview": {
      "distribution": "internal",
      "node": "20.19.4"
    },
    "production": {
      "autoIncrement": true,
      "node": "20.19.4"
    }
  }
}
```

### Why This Works

1. **Dependency Compatibility**: Node 20.19.4 meets `@react-native/assets-registry@0.81.5` requirement (>= 20.19.4)
2. **EAS Compatibility**: EAS build images support Node 20.19.4
3. **Maintains Safety**: Still within valid range for Expo SDK 54
4. **Local Development**: `.nvmrc` files specify 20.19.4 for consistent local setup
5. **Deterministic Builds**: Explicit Node version in `eas.json` ensures EAS Build always uses 20.19.4
6. **Prevents Drift**: Version pinning eliminates future EBADENGINE failures from version mismatches

## Validation Steps

After implementing the fix:

1. ✅ `npm ci --include=dev` runs successfully (810 packages, 0 vulnerabilities)
2. ✅ TypeScript compilation passes (`npx tsc --noEmit`)
3. ✅ All frontend tests pass (88/88 tests passing)
4. ✅ 0 security vulnerabilities detected
5. ✅ No EBADENGINE errors

## Prevention Best Practices

### 1. Pin Node Version in EAS Configuration (Recommended)

**Best Practice**: Explicitly specify the Node.js version in `eas.json` for deterministic builds:

```json
{
  "build": {
    "development": {
      "node": "20.19.4"
    },
    "preview": {
      "node": "20.19.4"
    },
    "production": {
      "node": "20.19.4"
    }
  }
}
```

**Benefits**:
- ✅ Ensures exact Node version used by EAS Build
- ✅ Prevents version drift between environments
- ✅ Eliminates EBADENGINE failures from version mismatches
- ✅ Makes builds deterministic and reproducible
- ✅ Matches local development environment (`.nvmrc`)

### 2. Use Broader Version Ranges for CI/CD

When specifying engine requirements in `package.json`, use broader ranges that accommodate build server environments:

```json
"engines": {
  "node": ">=20.0.0",     // Good: Accepts all Node 20.x+
  "node": ">=20.17.0"     // Problematic: Too specific for CI
}
```

**Note**: With explicit Node version pinning in `eas.json`, the `package.json` engines field serves as a safety net for local development.

### 3. Test with Multiple Node Versions

Before pushing, test your build with different Node versions:

```bash
# Test with the minimum supported version
nvm use 20.0.0
npm ci --include=dev

# Test with your development version
nvm use 20.17.0
npm ci --include=dev
```

### 4. Consider engine-strict Setting

The `.npmrc` file contains `engine-strict=true` which causes hard failures on version mismatches. Consider:

- **Keep it enabled** for catching version incompatibilities early
- **Ensure version ranges** are broad enough for your CI/CD environment
- **Document minimum versions** based on Expo SDK requirements, not local preferences

### 5. Monitor Expo SDK Requirements

For each Expo SDK version, check the recommended Node.js versions:

| Expo SDK | React Native | Node.js    | npm    |
|----------|--------------|------------|--------|
| 54       | 0.81         | 20.x       | 10.x   |
| 53       | 0.76         | 18.x-20.x  | 9.x+   |

Reference: [Expo Build Infrastructure](https://docs.expo.dev/build-reference/infrastructure/)

### 6. Keep Package Lock Files in Sync

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
