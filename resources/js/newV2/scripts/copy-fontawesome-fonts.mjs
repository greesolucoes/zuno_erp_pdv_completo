import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceDir = path.join(repoRoot, 'node_modules', 'font-awesome', 'fonts')
const targetDir = path.join(repoRoot, 'public', 'fonts')

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function copyFile(source, target) {
  fs.copyFileSync(source, target)
}

function main() {
  if (!fs.existsSync(sourceDir)) {
    console.error(`Fonte não encontrada: ${sourceDir}`)
    process.exitCode = 1
    return
  }

  ensureDir(targetDir)

  const files = fs
    .readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.startsWith('fontawesome-webfont.'))

  if (files.length === 0) {
    console.error('Nenhum arquivo de fonte do Font Awesome foi encontrado para copiar.')
    process.exitCode = 1
    return
  }

  for (const filename of files) {
    copyFile(path.join(sourceDir, filename), path.join(targetDir, filename))
  }

  console.log(`OK: copiou ${files.length} fontes para public/fonts`)
}

main()
