// Script to add isNew and isOnline fields to all profiles
const fs = require('fs');
const path = require('path');

const mockProfilesPath = path.join(__dirname, '../src/data/mockProfiles.ts');
let content = fs.readFileSync(mockProfilesPath, 'utf8');

// Remove duplicate neighborhoods lines and broken syntax
content = content.replace(/  },\s+neighborhoods: \["[^"]+",?\s?"?[^"\]]*"?\],\s+},/g, '  },');

// Add isNew and isOnline to profiles that don't have them
content = content.replace(
  /(neighborhoods: \[[^\]]+\]),(\s+)}/g,
  (match, neighborhoods, spacing) => {
    // Check if isNew already exists after neighborhoods
    if (match.includes('isNew:')) {
      return match;
    }
    // Extract the profile ID from context
    const lines = content.substring(0, content.indexOf(match)).split('\n');
    const idLine = lines.reverse().find(line => line.includes('id:'));
    const id = idLine ? parseInt(idLine.match(/id:\s*(\d+)/)?.[1] || '0') : 0;
    
    return `${neighborhoods},${spacing}isNew: ${id % 2 !== 0 && id < 20},${spacing}isOnline: ${id % 3 === 0},${spacing}}`;
  }
);

fs.writeFileSync(mockProfilesPath, content, 'utf8');
console.log('✅ Profile fields updated successfully!');
