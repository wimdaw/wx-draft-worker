/**
 * 构建 Cloudflare Pages 产物：dist/pages/_worker.js
 *
 * 原理：Pages 的「高级模式（Advanced Mode）」会在站点根目录寻找 `_worker.js`，
 * 由它接管全部请求；本项目的 Hono 应用 `export default app` 天然兼容该约定
 * （Pages 会从 `fetch` 属性调用，D1 / 变量等绑定以 `env` 传入）。
 *
 * 用法：
 *   node scripts/build-pages.mjs
 *   然后在 Pages 项目里把「构建输出目录」设为 dist/pages
 */
import { build } from 'esbuild'
import { mkdirSync } from 'node:fs'

const OUT_DIR = 'dist/pages'

mkdirSync(OUT_DIR, { recursive: true })

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'esm',
  target: 'es2022',
  platform: 'browser',
  outfile: `${OUT_DIR}/_worker.js`,
  minify: true,
  logLevel: 'info',
})

console.log('\n✅ Pages 产物：dist/pages/_worker.js')
console.log('   下一步：把 Pages 项目的输出目录设为 dist/pages，并在项目设置里绑定 D1（变量名 DB）')
