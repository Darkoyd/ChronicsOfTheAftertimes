// Shared view of the archive as a filesystem, built from content/ (written by scripts/sync.mjs).
export type ArchiveFile = { _path: string, title?: string, size?: number, recovered?: string, source?: string, integrity?: string }

let files: ArchiveFile[] | null = null
// Content is fixed per build, so one query is enough.
export const archiveFiles = async (): Promise<ArchiveFile[]> =>
    files ??= await queryContent().only(['_path', 'title', 'size', 'recovered', 'source', 'integrity']).find() as ArchiveFile[]

// Resolves `target` against `cwd` like a shell: /, ~, ., .. and relative segments.
export const resolvePath = (cwd: string, target = '~'): string => {
    const absolute = target.startsWith('/') || target === '~' || target.startsWith('~/')
    const parts = [...(absolute ? [] : cwd.split('/')), ...target.replace(/^~/, '').split('/')]
    const out: string[] = []
    for (const p of parts) {
        if (!p || p === '.') continue
        if (p === '..') out.pop()
        else out.push(p)
    }
    return '/' + out.join('/')
}

export const pathType = (all: ArchiveFile[], path: string): 'file' | 'dir' | null => {
    if (path === '/') return 'dir'
    if (all.some(f => f._path === path)) return 'file'
    if (all.some(f => f._path.startsWith(path + '/'))) return 'dir'
    return null
}
