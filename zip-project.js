const fs = require('fs');
const path = require('path');
const { createWriteStream } = require('fs');
const { createDeflateRaw } = require('zlib');

const projectDir = __dirname;
const outputZip = path.join(projectDir, '../lilt-mvp-upload.zip');

const includeFiles = [
  'package.json',
  'package-lock.json',
  'next.config.js',
  'tsconfig.json',
  'tailwind.config.js',
  'postcss.config.js',
  '.gitignore',
  'src/',
  'app/',
  'public/'
];

const excludePatterns = [
  /\.git/,
  /node_modules/,
  /\.next/,
  /\.env/,
  /dist/,
  /\.cache/,
  /\.zip$/
];

function shouldInclude(filePath) {
  for (const pattern of excludePatterns) {
    if (pattern.test(filePath)) {
      return false;
    }
  }
  return true;
}

function collectFiles(dir, basePath = '') {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relPath = basePath ? path.join(basePath, item) : item;
    
    if (!shouldInclude(fullPath)) {
      continue;
    }
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...collectFiles(fullPath, relPath));
    } else {
      files.push({
        path: fullPath,
        relPath: relPath
      });
    }
  }
  
  return files;
}

function crc32(data) {
  let crc = 0xffffffff;
  const table = [];
  
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  
  return (crc ^ 0xffffffff) >>> 0;
}

function createZipEntry(filePath, relPath) {
  const data = fs.readFileSync(filePath);
  const crc = crc32(data);
  
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0); // Local file header signature
  header.writeUInt16LE(20, 4); // Version needed to extract
  header.writeUInt16LE(0, 6); // General purpose bit flag
  header.writeUInt16LE(8, 8); // Compression method (deflate)
  const now = new Date();
  const msdosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xffff;
  const msdosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;
  header.writeUInt16LE(msdosTime, 10);
  header.writeUInt16LE(msdosDate, 12);
  header.writeUInt32LE(crc, 14);
  
  const deflated = require('zlib').deflateSync(data);
  header.writeUInt32LE(deflated.length, 18);
  header.writeUInt32LE(data.length, 22);
  
  const relPathBytes = Buffer.from(relPath, 'utf-8');
  header.writeUInt16LE(relPathBytes.length, 26);
  header.writeUInt16LE(0, 28); // Extra field length
  
  return Buffer.concat([header, relPathBytes, deflated]);
}

function createCentralDirectoryEntry(filePath, relPath, offset, fileSize) {
  const data = fs.readFileSync(filePath);
  const crc = crc32(data);
  const deflated = require('zlib').deflateSync(data);
  
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0); // Central directory file header signature
  header.writeUInt16LE(3, 4); // Version made by
  header.writeUInt16LE(20, 6); // Version needed to extract
  header.writeUInt16LE(0, 8); // General purpose bit flag
  header.writeUInt16LE(8, 10); // Compression method
  const now = new Date();
  const msdosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xffff;
  const msdosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;
  header.writeUInt16LE(msdosTime, 12);
  header.writeUInt16LE(msdosDate, 14);
  header.writeUInt32LE(crc, 16);
  header.writeUInt32LE(deflated.length, 20);
  header.writeUInt32LE(data.length, 24);
  
  const relPathBytes = Buffer.from(relPath, 'utf-8');
  header.writeUInt16LE(relPathBytes.length, 28);
  header.writeUInt16LE(0, 30); // Extra field length
  header.writeUInt16LE(0, 32); // File comment length
  header.writeUInt16LE(0, 34); // Disk number start
  header.writeUInt16LE(0, 36); // Internal file attributes
  header.writeUInt32LE(0x81000000, 38); // External file attributes (regular file)
  header.writeUInt32LE(offset, 42); // Relative offset of local header
  
  return Buffer.concat([header, relPathBytes]);
}

function createEndOfCentralDirectory(entries, centralDirOffset, centralDirSize) {
  const header = Buffer.alloc(22);
  header.writeUInt32LE(0x06054b50, 0); // End of central directory signature
  header.writeUInt16LE(0, 4); // Number of this disk
  header.writeUInt16LE(0, 6); // Disk where central directory starts
  header.writeUInt16LE(entries.length, 8); // Number of entries in central directory on this disk
  header.writeUInt16LE(entries.length, 10); // Total number of entries in central directory
  header.writeUInt32LE(centralDirSize, 12); // Size of central directory
  header.writeUInt32LE(centralDirOffset, 16); // Offset of start of central directory
  header.writeUInt16LE(0, 20); // Comment length
  
  return header;
}

console.log('========================================');
console.log('Creating lilt-mvp-upload.zip');
console.log('========================================\n');

const files = collectFiles(projectDir);
console.log('Files to include:');
files.forEach(f => console.log(`  - ${f.relPath}`));
console.log(`\nTotal: ${files.length} files`);

const zipParts = [];
const centralEntries = [];
let offset = 0;

for (const file of files) {
  const entry = createZipEntry(file.path, file.relPath);
  zipParts.push(entry);
  
  centralEntries.push({
    file,
    offset,
    size: entry.length
  });
  
  offset += entry.length;
}

console.log('\nBuilding central directory...');
const centralDirParts = [];
let centralDirOffset = offset;

for (const entry of centralEntries) {
  const centralEntry = createCentralDirectoryEntry(entry.file.path, entry.file.relPath, entry.offset, entry.size);
  centralDirParts.push(centralEntry);
  offset += centralEntry.length;
}

const centralDir = Buffer.concat(centralDirParts);
zipParts.push(centralDir);

console.log('Building end of central directory...');
const endOfCentralDir = createEndOfCentralDirectory(centralEntries, centralDirOffset, centralDir.length);
zipParts.push(endOfCentralDir);

console.log('Writing zip file...');
fs.writeFileSync(outputZip, Buffer.concat(zipParts));

const stats = fs.statSync(outputZip);
console.log(`\n✅ Zip file created successfully!`);
console.log(`Location: ${outputZip}`);
console.log(`Size: ${stats.size} bytes (${(stats.size / 1024).toFixed(2)} KB)`);
console.log('========================================');
