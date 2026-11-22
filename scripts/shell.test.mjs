// Self-check for the ls/cd logic outside Nuxt. Run: node scripts/shell.test.mjs
import assert from 'node:assert/strict'
import createJiti from 'jiti'

const jiti = createJiti(import.meta.url)
const FILES = [
    { _path: '/records/kaori/first-raid', size: 2048, recovered: '0007', source: 'kaori' },
    { _path: '/records/rai/lecture', size: 15, recovered: '0012', source: 'rai' },
    { _path: '/readme', size: 10, recovered: '0001-01-01', source: 'system' },
]
// Stub the Nuxt auto-imports the utils rely on
globalThis.ref = (value) => ({ value })
globalThis.queryContent = () => ({ only: () => ({ find: async () => FILES }) })
Object.assign(globalThis, jiti('../utils/fs.ts'))
const cdMod = jiti('../utils/cd.ts')
globalThis.useDirectory = cdMod.useDirectory
const cd = cdMod.default
const ls = jiti('../utils/ls.ts').default
const pwd = () => useDirectory().getCurrentDirectory()

assert.equal(resolvePath('/a/b', '../c/./d'), '/a/c/d')
assert.equal(resolvePath('/a/b', '~/x'), '/x')
assert.equal(resolvePath('/a', '../../..'), '/')

assert.equal(await ls([]), 'readme\nrecords')
assert.equal(await ls(['-F']), 'readme\nrecords/')
assert.equal(await ls(['-x']), "ls: invalid option -- 'x'\nTry 'help ls' for more information. I wrote it for exactly this kind of moment.")
assert.equal(await ls(['nope']), "ls: cannot access 'nope': No such file or directory\nNothing there. Not even a ruin.")
assert.match(await ls(['a', 'b']), /'b'.*\nNone of those exist/)
assert.equal(await ls(['records', '-tr']), 'kaori\nrai')
assert.match(await ls(['-lh', 'records/kaori']), /^-r--r--r-- 1 kaori archive 2K 0007 first-raid$/)
assert.equal(await ls(['-R', 'records']), 'records:\nkaori\nrai\n\nrecords/kaori:\nfirst-raid\n\nrecords/rai:\nlecture')
assert.match(await ls(['-a']), /^\.\n\.\.\nreadme/)

assert.equal(await cd(['records/kaori']), '')
assert.equal(pwd(), '/records/kaori')
assert.equal(await ls(['../rai']), 'lecture')
assert.match(await cd(['first-raid']), /^cd: first-raid: Not a directory\n/)
assert.match(await cd(['nope']), /^cd: nope: No such file or directory\n/)
assert.match(await cd(['a', 'b']), /^cd: too many arguments\n/)
assert.equal(await cd([]), '')
assert.equal(pwd(), '/')
assert.equal(await cd(['-']), '/records/kaori')
console.log('shell ok')
