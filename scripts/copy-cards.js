const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../client/public/cards');
const destDir = path.join(__dirname, '../client/dist/cards');

// Create destination directory
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy all files
fs.readdirSync(sourceDir).forEach(file => {
  fs.copyFileSync(
    path.join(sourceDir, file),
    path.join(destDir, file)
  );
  console.log(`Copied: ${file}`);
});

console.log('All cards copied successfully!');