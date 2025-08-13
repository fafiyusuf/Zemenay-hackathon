import { readFileSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const dist = resolve(__dirname, '..', 'dist')
function buildCjs(baseName) {
  const esmPath = resolve(dist, baseName + '.js')
  let esm = readFileSync(esmPath, 'utf8')
  let cjs = esm
  .replace(/export class /g, 'class ')
  .replace(/export function /g, 'function ')
  .replace(/export default ([^;]+);/g, 'const __default = $1;')
  const namedMatches = [...esm.matchAll(/export (?:class|function|const|let|var) (\w+)/g)].map(m => m[1])
  cjs += `\nmodule.exports = { ${namedMatches.join(', ')}, default: typeof __default!=='undefined'?__default:undefined };\n`
  writeFileSync(resolve(dist, baseName + '.cjs'), cjs)
}

buildCjs('index')
buildCjs('server')
console.log('[chat-client] Generated CommonJS builds.')
