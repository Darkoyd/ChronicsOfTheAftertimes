// Directory state management
const currentDirectory = ref('/')
const previousDirectory = ref('/')

export const useDirectory = () => ({
    getCurrentDirectory: () => currentDirectory.value,
    setCurrentDirectory: (path: string) => {
        previousDirectory.value = currentDirectory.value
        currentDirectory.value = path
    },
    getPreviousDirectory: () => previousDirectory.value,
})

// cd [dir] — supports /, ~, -, ., .. and relative paths like ../a/b
export default async (args: string[] = []) => {
    args = args.filter(Boolean)
    const { getCurrentDirectory, setCurrentDirectory, getPreviousDirectory } = useDirectory()
    if (args.length > 1) return 'cd: too many arguments\nYou can only be in one place at a time. Unlike some of us.'

    const target = args[0] ?? '~'
    const path = target === '-' ? getPreviousDirectory() : resolvePath(getCurrentDirectory(), target)
    const type = pathType(await archiveFiles(), path)

    if (type === null) return `cd: ${target}: No such file or directory\nI contain everything that ever existed. That isn't part of it.`
    if (type === 'file') return `cd: ${target}: Not a directory\nThat's a record, not a room. Some of them were people. Don't try to walk into them.`
    setCurrentDirectory(path)
    return target === '-' ? path : '' // bash prints the new dir for `cd -`
}
