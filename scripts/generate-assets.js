const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'apps', 'mobile', 'assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Valid base64 encoded PNG (1024x1024 solid blue canvas PNG)
const base64Png = 
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const pngBuffer = Buffer.from(base64Png, 'base64');

const files = ['icon.png', 'splash.png', 'adaptive-icon.png', 'favicon.png'];

files.forEach((file) => {
  const filePath = path.join(assetsDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, pngBuffer);
    console.log(`Created ${filePath}`);
  }
});
