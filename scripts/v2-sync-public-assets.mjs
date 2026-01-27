import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const srcRoot = path.join(repoRoot, 'resources', 'js', 'newV2', 'public')
const destRoot = path.join(repoRoot, 'public')

const mappings = [
  { from: 'css', to: 'css' },
  { from: 'js', to: 'js' },
  { from: 'img', to: 'img' },
  { from: 'fonts', to: 'fonts' },
  { from: 'vite.svg', to: 'vite.svg' },
]

function exists(p) {
  try {
    fs.accessSync(p, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

function copyFile(srcFile, destFile) {
  ensureDir(path.dirname(destFile))
  fs.copyFileSync(srcFile, destFile)
}

function copyDir(srcDir, destDir) {
  if (!exists(srcDir)) return
  ensureDir(destDir)
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name)
    const dest = path.join(destDir, entry.name)
    if (entry.isDirectory()) copyDir(src, dest)
    else if (entry.isFile()) copyFile(src, dest)
  }
}

if (!exists(srcRoot)) process.exit(0)

for (const m of mappings) {
  const src = path.join(srcRoot, m.from)
  const dest = path.join(destRoot, m.to)
  if (!exists(src)) continue
  const stat = fs.statSync(src)
  if (stat.isDirectory()) copyDir(src, dest)
  else copyFile(src, dest)
}

