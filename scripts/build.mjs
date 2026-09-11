/**
 * 构建 Worker 产物：
 *   dist/worker.js        —— 单文件版（Cloudflare Dashboard 直接粘贴 / wrangler deploy 用）
 *   dist/pages/_worker.js —— Cloudflare Pages 高级模式（Pages 项目输出目录设为 dist/pages）
 *
 * 用法：node scripts/build.mjs
 */
import { build } from 'esbuild'
import { mkdirSync } from 'node:fs'

mkdirSync('dist/pages', { recursive: true })

const common = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'esm',
  target: 'es2022',
  platform: 'browser',
  minify: true,
}

await build({ ...common, outfile: 'dist/worker.js' })
await build({ ...common, outfile: 'dist/pages/_worker.js' })

console.log('\n✅ 产物：')
console.log('   dist/worker.js         （Workers：wrangler deploy / Dashboard 粘贴）')
console.log('   dist/pages/_worker.js  （Pages：输出目录 dist/pages）')
