const fs = require('fs')
const path = require('path')

const srcDir = path.join(__dirname, 'src', 'app')
const apiDir = path.join(srcDir, 'api')

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f)
    let isDirectory = fs.statSync(dirPath).isDirectory()
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f))
  })
}

const apiRoutes = []
walkDir(apiDir, (filePath) => {
  if (filePath.endsWith('route.ts') || filePath.endsWith('route.js')) {
    let route = filePath.replace(apiDir, '/api').replace('/route.ts', '').replace('/route.js', '')
    // handle dynamic segments like /api/tasks/[taskId] -> convert to regex or simple wildcard matcher
    apiRoutes.push(route)
  }
})

const fetchCalls = []
walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const regex = /fetch\(['"`](\/api\/[^'"`?]+)/g
    let match
    while ((match = regex.exec(content)) !== null) {
      fetchCalls.push({ file: filePath, endpoint: match[1] })
    }
  }
})

// Matcher function for dynamic routes
function doesRouteExist(endpoint) {
  // Strip trailing slashes
  endpoint = endpoint.replace(/\/$/, '')
  
  for (const route of apiRoutes) {
    // If exact match
    if (route === endpoint) return true
    
    // If route has dynamic segments like [id]
    if (route.includes('[')) {
      const regexStr = '^' + route.replace(/\[.*?\]/g, '[^/]+') + '$'
      const regex = new RegExp(regexStr)
      if (regex.test(endpoint)) return true
    }
  }
  return false
}

const missing = []
fetchCalls.forEach(call => {
  if (!doesRouteExist(call.endpoint)) {
    missing.push(call)
  }
})

console.log(`Found ${apiRoutes.length} API routes.`)
console.log(`Found ${fetchCalls.length} fetch calls.`)
if (missing.length === 0) {
  console.log('SUCCESS: All fetch endpoints have matching API routes!')
} else {
  console.log(`Found ${missing.length} unmatched endpoints:`)
  const uniqueMissing = [...new Set(missing.map(m => m.endpoint))]
  uniqueMissing.forEach(ep => {
    console.log(`- ${ep}`)
    missing.filter(m => m.endpoint === ep).forEach(m => {
      console.log(`  in ${m.file.replace(__dirname, '')}`)
    })
  })
}
