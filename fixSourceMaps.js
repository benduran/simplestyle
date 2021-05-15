const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

const folders = fs.readdirSync(distDir);

folders.forEach(fp => {
  const folderPath = path.join(distDir, fp);
  const sourceMaps = fs.readdirSync(folderPath).filter(file => file.endsWith('.map'));
  sourceMaps.forEach(map => {
    const mapPath = path.join(folderPath, map);
    const contents = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    for (let i = 0; i < contents.sources.length; i++) {
      contents.sources[i] = contents.sources[i].replace(/(.*\/src)/, '.');
    }
    fs.writeFileSync(mapPath, JSON.stringify(contents), 'utf8');
  });
});
