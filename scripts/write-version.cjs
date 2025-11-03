// Generates public/version.json from package.json.version
// Run automatically via npm prebuild/prestart scripts
// Works in Windows and Unix environments

const fs = require('fs');
const path = require('path');

try {
  const root = __dirname ? path.resolve(__dirname, '..') : process.cwd();
  const pkgPath = path.join(root, 'package.json');
  const publicDir = path.join(root, 'public');
  const outPath = path.join(publicDir, 'version.json');

  const pkgRaw = fs.readFileSync(pkgPath, 'utf8');
  const pkg = JSON.parse(pkgRaw);
  const version = pkg.version || '';

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const payload = JSON.stringify({ version }, null, 2);
  fs.writeFileSync(outPath, payload, 'utf8');
  console.log(`Wrote ${outPath} with version ${version}`);
} catch (err) {
  console.error('Failed to write version.json:', err);
  process.exit(0); // Do not fail the build on version file issues
}
