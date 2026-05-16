const fs = require('fs');
const path = require('path');

const workspaceDir = '/home/veer/Ranveer/PO/pioneer-os';
const layoutDir = path.join(workspaceDir, 'src/client/components/layout');
const appDir = path.join(workspaceDir, 'src/app/(dashboard)');

const files = fs.readdirSync(layoutDir).filter(f => f.endsWith('Nav.tsx') || f === 'UnifiedSidebar.tsx');

let allMissing = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(layoutDir, file), 'utf8');
  
  const regex1 = /href:\s*['"](\/[^'"]+)['"]/g;
  let match;
  while ((match = regex1.exec(content)) !== null) checkLink(match[1], file);

  const regex2 = /href=['"](\/[^'"]+)['"]/g;
  while ((match = regex2.exec(content)) !== null) checkLink(match[1], file);
});

function checkLink(link, sourceFile) {
  if (link.includes('?')) link = link.split('?')[0];
  if (link.includes('#')) link = link.split('#')[0];
  
  // Globals
  if (['/', '/mash', '/ideas', '/arcade', '/directory', '/team/org-chart'].includes(link)) return;
  if (link.startsWith('/tasks') || link.startsWith('/mykohi-portal') || link.startsWith('/client-login')) return;
  if (link.includes('[')) return; 

  const routePath = path.join(appDir, link, 'page.tsx');
  if (!fs.existsSync(routePath)) {
    const dirPath = path.join(appDir, link);
    if (!fs.existsSync(dirPath)) {
      const parts = link.split('/').filter(Boolean);
      let currentPath = appDir;
      let found = true;
      for (const part of parts) {
        if (!fs.existsSync(path.join(currentPath, part))) {
           const subs = fs.readdirSync(currentPath).filter(f => fs.statSync(path.join(currentPath, f)).isDirectory());
           const dynamicSub = subs.find(s => s.startsWith('['));
           if (dynamicSub) {
             currentPath = path.join(currentPath, dynamicSub);
           } else {
             found = false;
             break;
           }
        } else {
           currentPath = path.join(currentPath, part);
        }
      }
      
      if (!found || !fs.existsSync(path.join(currentPath, 'page.tsx'))) {
        if (!allMissing.includes(link)) {
          allMissing.push(link);
          console.log(`Missing route: ${link} (found in ${sourceFile})`);
        }
      }
    } else if (!fs.existsSync(path.join(dirPath, 'page.tsx'))) {
      if (!allMissing.includes(link)) {
        allMissing.push(link);
        console.log(`Missing page.tsx: ${link} (found in ${sourceFile})`);
      }
    }
  }
}
