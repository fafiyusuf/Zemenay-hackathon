#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const dist = resolve(__dirname, '..', 'dist')
const esm = readFileSync(resolve(dist, 'index.mjs'), 'utf8')
// Simple transform: replace export syntax for CJS consumers
let cjs = esm
  .replace(/export class /g, 'class ') // classes
  .replace(/export function /g, 'function ') // functions
  .replace(/export { ([^}]+) };/g, 'module.exports = { $1 };')
  .replace(/export default ([^;]+);/g, 'module.exports.default = $1;')
// Append explicit exports if not already
if (!cjs.includes('module.exports')) {
  cjs += '\nmodule.exports = { ChatClient, createChatClient, default: ChatClient };' // rely on symbol names
}
writeFileSync(resolve(dist, 'index.cjs'), cjs)
console.log('[chat-client] Generated CommonJS build.')
