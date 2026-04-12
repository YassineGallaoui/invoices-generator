# Dependency Management Guide

This project includes scripts to help you safely check and update dependencies.

## Available Scripts

### 🔍 Check for Outdated Dependencies

```bash
pnpm deps:check
```

**What it does:** Shows a list of all outdated dependencies without making any changes.

**Safety:** ✅ **Completely safe** - Only reads and displays information.

**Example output:**

```
nuxt           ^4.4.2  →  ^4.5.0
vue           ^3.5.32  →  ^3.5.40
motion-v       ^2.2.1  →  ^2.3.0
```

---

### 🔄 Interactive Update (Recommended)

```bash
pnpm deps:update
```

**What it does:** Opens an interactive menu where you can select which dependencies to update.

**Safety:** ⚠️ **Moderate** - You control what gets updated, but major version updates may include breaking changes.

**How to use:**

1. Run the command
2. Use arrow keys to navigate
3. Press `Space` to select/deselect packages
4. Press `Enter` to confirm
5. Run `pnpm install` to install the selected updates
6. Test your application thoroughly

---

### 📦 Update Minor & Patch Versions

```bash
pnpm deps:update:minor
```

**What it does:** Automatically updates all dependencies to their latest minor and patch versions (e.g., `1.2.3` → `1.5.9`).

**Safety:** ✅ **Safer** - Minor and patch updates should be backward compatible according to semantic versioning.

**After running:**

```bash
pnpm install
pnpm build  # Test that everything still works
```

---

### 🛡️ Update Patch Versions Only (Safest)

```bash
pnpm deps:update:patch
```

**What it does:** Updates only patch versions (e.g., `1.2.3` → `1.2.9`). This is the safest update strategy.

**Safety:** ✅✅ **Safest** - Patch updates should only include bug fixes and security patches.

**After running:**

```bash
pnpm install
```

---

## Recommended Workflow

### For Regular Maintenance (Monthly)

```bash
# 1. Check what's outdated
pnpm deps:check

# 2. Update patch versions (safest)
pnpm deps:update:patch
pnpm install

# 3. Test your application
pnpm dev
pnpm build

# 4. If everything works, update minor versions
pnpm deps:update:minor
pnpm install

# 5. Test again
pnpm dev
pnpm build
```

### For Major Updates (Quarterly or as needed)

```bash
# 1. Check what's outdated
pnpm deps:check

# 2. Use interactive mode to carefully select updates
pnpm deps:update

# 3. Install and test thoroughly
pnpm install
pnpm lint
pnpm build
pnpm dev

# 4. Check for breaking changes in the changelogs of major updates
```

---

## Understanding Semantic Versioning

Dependencies follow semantic versioning: `MAJOR.MINOR.PATCH`

- **PATCH** (e.g., `1.2.3` → `1.2.4`): Bug fixes, no breaking changes
- **MINOR** (e.g., `1.2.3` → `1.3.0`): New features, backward compatible
- **MAJOR** (e.g., `1.2.3` → `2.0.0`): Breaking changes, may require code updates

---

## Tips

1. **Always test after updating** - Run `pnpm build` and `pnpm dev` to ensure everything works
2. **Read changelogs** - For major updates, check the package's changelog for breaking changes
3. **Update regularly** - Smaller, frequent updates are easier to manage than large, infrequent ones
4. **Commit before updating** - Always commit your changes before running update scripts
5. **Check for vulnerabilities** - Run `pnpm audit` to check for security issues

---

## Troubleshooting

### After updating, the build fails

```bash
# Restore your package.json from git
git checkout package.json

# Or manually revert the changes
# Then try updating fewer packages at once
```

### Dependency conflicts

```bash
# Clear node_modules and lockfile
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install
```

### Want to update a specific package only

```bash
# Use ncu with a filter
pnpm dlx npm-check-updates -u --filter "package-name"
pnpm install
```

---

## Additional Resources

- [npm-check-updates documentation](https://github.com/raineorshine/npm-check-updates)
- [Semantic Versioning](https://semver.org/)
- [pnpm CLI reference](https://pnpm.io/cli/add)
