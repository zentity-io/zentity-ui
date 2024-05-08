const fs = require('fs')
const path = require('path')

let dir = process.argv[2] || 'dist'
switch (dir) {
  case 'app':
    dir = path.join('dist', 'app')
    break
  case 'server':
    dir = path.join('dist', 'server')
    break
  case 'dist':
    dir = 'dist'
    break
  default:
    throw 'Unsupported directory'
}

const rmr = (dir) => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((filename, idx) => {
      const _path = path.join(dir, filename)
      if(fs.lstatSync(_path).isDirectory())
        rmr(_path)
      else
        fs.unlinkSync(_path)
    })
    fs.rmdirSync(dir)
  }
}

console.debug('Removing ' + dir)
rmr(dir)
