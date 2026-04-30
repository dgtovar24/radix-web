import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.astro')) results.push(file);
    }
  });
  return results;
}

const files = walk('src/pages');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  let inFrontmatter = false;
  let firstFrontmatterFound = false;
  
  // Reconstruct correctly
  let newLines = [];
  let importAdded = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Remove the bad imports and the viewtransitions tag (we will add them back correctly)
    if (line.includes('import { ViewTransitions } from "astro:transitions";')) continue;
    if (line.includes('<ViewTransitions />')) continue;
    
    if (line.trim() === '---') {
      if (!firstFrontmatterFound) {
        firstFrontmatterFound = true;
        inFrontmatter = true;
        newLines.push(line);
        newLines.push('import { ViewTransitions } from "astro:transitions";');
        continue;
      } else if (inFrontmatter) {
        inFrontmatter = false;
      }
    }
    
    if (line.includes('</head>')) {
      newLines.push('  <ViewTransitions />');
    }
    
    newLines.push(line);
  }
  
  fs.writeFileSync(file, newLines.join('\n'));
});
