const esbuild = require('esbuild');
const fs = require('fs');

if (!fs.existsSync('dist')) fs.mkdirSync('dist', { recursive: true });

esbuild.build({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  outfile: 'dist/bundle.js',
  platform: 'browser',
  target: ['chrome100'],
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
}).then(() => {
  console.log('Build complete!');
}).catch(() => process.exit(1));
