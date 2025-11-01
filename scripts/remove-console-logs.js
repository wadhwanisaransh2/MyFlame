const fs = require('fs');
const path = require('path');

// Function to remove console logs from a file
function removeConsoleLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove console.log, console.warn, console.error statements
    const consoleRegex = /console\.(log|warn|error|info|debug)\([^)]*\);?\s*/g;
    const originalContent = content;
    content = content.replace(consoleRegex, '');
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Removed console logs from: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively process directory
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  let processedCount = 0;
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other build directories
      if (!['node_modules', 'android', 'ios', '.git', 'build', 'dist'].includes(item)) {
        processedCount += processDirectory(fullPath);
      }
    } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.js'))) {
      if (removeConsoleLogs(fullPath)) {
        processedCount++;
      }
    }
  });
  
  return processedCount;
}

// Main execution
if (require.main === module) {
  const srcPath = path.join(__dirname, '..', 'src');
  console.log('Starting console log removal process...');
  
  if (fs.existsSync(srcPath)) {
    const processedCount = processDirectory(srcPath);
    console.log(`Process completed. Removed console logs from ${processedCount} files.`);
  } else {
    console.error('src directory not found at:', srcPath);
    process.exit(1);
  }
}

module.exports = { removeConsoleLogs, processDirectory };
