#!/usr/bin/env node
// Copies vault notes with an `archive:` frontmatter key into content/, at that in-universe path.
// Usage: VAULT=~/Documents/Obsidian/SciFi/SciFi node scripts/sync.mjs [--dry-run] [--local]
//   --dry-run  show what would be published, write nothing
//   --local    also list vault notes that are NOT published
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, statSync } from 'node:fs'
import { join, relative, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const VAULT = process.env.VAULT?.replace(/^~/, process.env.HOME)
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'content')
const DRY = process.argv.includes('--dry-run')
const LOCAL = process.argv.includes('--local')
// Frontmatter keys copied to the site. Everything else in the note's frontmatter stays private.
const PUBLIC_KEYS = ['recovered', 'source', 'integrity']
// Lowercase, no leading dot/dash/number-dot: Nuxt Content lowercases, hides, or strips those.
const SEGMENT = /^(?!\d+\.)[a-z0-9][a-z0-9_-]*(\.[a-z0-9_-]+)*$/

if (!VAULT) { console.error('Set VAULT to the vault folder'); process.exit(1) }

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  if (name.startsWith('.')) return [] // .git, .obsidian, .trash
  const p = join(dir, name)
  return statSync(p).isDirectory() ? walk(p) : name.endsWith('.md') ? [p] : []
})

const parse = (text) => {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  const meta = {}
  if (m) for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/)
    if (kv) meta[kv[1]] = kv[2].trim().replace(/^(["'])(.*)\1$/, '$2')
  }
  return { meta, body: m ? text.slice(m[0].length) : text }
}

const clean = (body) => body
  .replace(/%%[\s\S]*?%%/g, '') // Obsidian comments are private notes
  .replace(/!?\[\[([^\]|#]*)(?:#[^\]|]*)?(?:\|([^\]]*))?\]\]/g, (_, target, alias) => alias ?? target)

const notes = walk(VAULT).map((file) => ({ file, ...parse(readFileSync(file, 'utf8')) }))
const published = []
const errors = []
const seen = new Map()

for (const n of notes) {
  if (!n.meta.archive) continue
  const path = n.meta.archive.replace(/^\/+|\/+$|\.md$/g, '')
  const where = relative(VAULT, n.file)
  if (!path.split('/').every((s) => SEGMENT.test(s))) errors.push(`${where}: bad archive path "${n.meta.archive}" (use lowercase a-z 0-9 - _ separated by /)`)
  else if (seen.has(path)) errors.push(`${where}: archive path "${path}" already used by ${seen.get(path)}`)
  else { seen.set(path, where); published.push({ ...n, path, where }) }
}

if (errors.length) { console.error(errors.join('\n')); process.exit(1) }

if (!DRY) rmSync(OUT, { recursive: true, force: true }) // unflagged notes disappear from the site
for (const n of published.sort((a, b) => a.path.localeCompare(b.path))) {
  const body = clean(n.body)
  const fm = { title: basename(n.file, '.md'), size: Buffer.byteLength(body) }
  for (const k of PUBLIC_KEYS) if (n.meta[k]) fm[k] = n.meta[k]
  // JSON-quoted values: `recovered` is free text (no calendar yet), so YAML must not parse it as a date
  const out = `---\n${Object.entries(fm).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n')}\n---\n${body}`
  if (!DRY) {
    mkdirSync(dirname(join(OUT, n.path)), { recursive: true })
    writeFileSync(join(OUT, n.path + '.md'), out)
  }
  console.log(`published  /${n.path}  <-  ${n.where}`)
}
if (LOCAL) for (const n of notes) if (!n.meta.archive) console.log(`local      ${relative(VAULT, n.file)}`)
console.log(`\n${published.length} published, ${notes.length - published.length} local only${DRY ? ' (dry run, nothing written)' : ''}`)
