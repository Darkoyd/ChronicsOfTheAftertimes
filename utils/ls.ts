// ls [-alhRtSrF1] [path...] over the archive
const FLAGS = 'alhRtSrF1'

type Entry = { name: string, isDir: boolean, size: number, recovered: string, source: string }

const humanSize = (bytes: number) => {
    const units = ['', 'K', 'M', 'G', 'T']
    let size = bytes, i = 0
    while (size >= 1024 && i < units.length - 1) { size /= 1024; i++ }
    return i === 0 ? String(size) : `${Math.round(size * 10) / 10}${units[i]}`
}

// Direct children of `dir`. Subdirectories inherit their newest recovered date and a 4096 size, like real ls.
const children = (all: ArchiveFile[], dir: string): Entry[] => {
    const prefix = dir === '/' ? '/' : dir + '/'
    const map = new Map<string, Entry>()
    for (const f of all) {
        if (!f._path.startsWith(prefix)) continue
        const [name, ...rest] = f._path.slice(prefix.length).split('/')
        if (!name) continue
        const recovered = f.recovered ?? ''
        if (rest.length === 0) {
            map.set(name, { name, isDir: false, size: f.size ?? 0, recovered, source: f.source ?? 'unknown' })
        } else {
            const d = map.get(name) ?? { name, isDir: true, size: 4096, recovered: '', source: 'archive' }
            if (recovered > d.recovered) d.recovered = recovered
            map.set(name, d)
        }
    }
    return [...map.values()]
}

const fileEntry = (f: ArchiveFile, name: string): Entry =>
    ({ name, isDir: false, size: f.size ?? 0, recovered: f.recovered ?? '', source: f.source ?? 'unknown' })

const dirEntry = (name: string): Entry => ({ name, isDir: true, size: 4096, recovered: '', source: 'archive' })

const sortEntries = (entries: Entry[], o: Set<string>) => {
    entries.sort((a, b) =>
        o.has('S') ? b.size - a.size || a.name.localeCompare(b.name)
        : o.has('t') ? b.recovered.localeCompare(a.recovered) || a.name.localeCompare(b.name)
        : a.name.localeCompare(b.name))
    if (o.has('r')) entries.reverse()
    return entries
}

const format = (entries: Entry[], o: Set<string>) => {
    const name = (e: Entry) => e.name + (o.has('F') && e.isDir ? '/' : '')
    if (!o.has('l')) return entries.map(name).join('\n')
    const size = (e: Entry) => o.has('h') ? humanSize(e.size) : String(e.size)
    const ownerW = Math.max(0, ...entries.map(e => e.source.length))
    const sizeW = Math.max(0, ...entries.map(e => size(e).length))
    const dateW = Math.max(0, ...entries.map(e => e.recovered.length))
    return entries.map(e => [
        e.isDir ? 'drwxr-xr-x' : '-r--r--r--', // archive records are read-only
        e.isDir ? '2' : '1',
        e.source.padEnd(ownerW),
        'archive',
        size(e).padStart(sizeW),
        (e.recovered || '-').padEnd(dateW),
        name(e),
    ].join(' ')).join('\n')
}

const listDir = (all: ArchiveFile[], dir: string, o: Set<string>) => {
    const entries = sortEntries(children(all, dir), o)
    // . and .. are always first, regardless of sort, as in GNU ls -a
    const shown = o.has('a') ? [dirEntry('.'), dirEntry('..'), ...entries] : entries
    const body = format(shown, o)
    return { body, subdirs: entries.filter(e => e.isDir).map(e => (dir === '/' ? '' : dir) + '/' + e.name) }
}

export default async (args: string[] = []) => {
    const opts = new Set<string>()
    const operands: string[] = []
    for (const arg of args) {
        if (arg.startsWith('-') && arg.length > 1) {
            for (const c of arg.slice(1)) {
                if (!FLAGS.includes(c)) return `ls: invalid option -- '${c}'\nTry 'help ls' for more information. I wrote it for exactly this kind of moment.`
                opts.add(c)
            }
        } else if (arg) operands.push(arg)
    }

    const all = await archiveFiles()
    const cwd = useDirectory().getCurrentDirectory()
    const targets = operands.length ? operands : ['.']

    const errors: string[] = []
    const files: Entry[] = []
    const dirs: [string, string][] = [] // [label, path]
    for (const t of targets) {
        const path = resolvePath(cwd, t)
        const type = pathType(all, path)
        if (type === null) errors.push(`ls: cannot access '${t}': No such file or directory`)
        else if (type === 'file') files.push(fileEntry(all.find(f => f._path === path)!, t))
        else dirs.push([t, path])
    }

    const blocks: string[] = []
    if (files.length) blocks.push(format(sortEntries(files, opts), opts))
    const withHeaders = opts.has('R') || targets.length > 1
    const queue = [...dirs]
    while (queue.length) {
        const [label, path] = queue.shift()!
        const { body, subdirs } = listDir(all, path, opts)
        blocks.push(withHeaders ? `${label}:${body ? '\n' + body : ''}` : body)
        if (opts.has('R')) queue.unshift(...subdirs.map(p => [label.replace(/\/$/, '') + p.slice(path === '/' ? 0 : path.length), p] as [string, string]))
    }
    // One remark after the errors, not one per missing path. Even I have limits.
    if (errors.length) errors.push(errors.length > 1 ? 'None of those exist. That has to be a talent.' : 'Nothing there. Not even a ruin.')
    return [errors.join('\n'), blocks.join(withHeaders ? '\n\n' : '\n')].filter(Boolean).join('\n')
}
