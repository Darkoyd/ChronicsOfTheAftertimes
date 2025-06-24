// Directory state management
const currentDirectory = ref('/')

export const useDirectory = () => {
    const getCurrentDirectory = () => currentDirectory.value
    
    const setCurrentDirectory = (path: string) => {
        currentDirectory.value = path
    }
    
    return {
        getCurrentDirectory,
        setCurrentDirectory
    }
}

export default async (args: string[] = []) => {
    const { getCurrentDirectory, setCurrentDirectory } = useDirectory()
    
    if (args.length === 0) {
        // cd with no arguments goes to root
        setCurrentDirectory('/')
        return ''
    }
    
    const targetPath = args[0]
    const currentPath = getCurrentDirectory()
    
    try {
        let newPath: string
        
        if (targetPath === '/') {
            newPath = '/'
        } else if (targetPath === '..') {
            // Go up one directory
            if (currentPath === '/') {
                return '' // Already at root, no change
            }
            const pathParts = currentPath.split('/').filter(p => p)
            pathParts.pop() // Remove last directory
            newPath = pathParts.length > 0 ? '/' + pathParts.join('/') : '/'
        } else if (targetPath === '.') {
            // Stay in current directory
            return ''
        } else if (targetPath.startsWith('/')) {
            // Absolute path
            newPath = targetPath
        } else {
            // Relative path
            newPath = currentPath === '/' ? '/' + targetPath : currentPath + '/' + targetPath
        }
        
        // Normalize path (remove double slashes, etc.)
        newPath = newPath.replace(/\/+/g, '/')
        if (newPath !== '/' && newPath.endsWith('/')) {
            newPath = newPath.slice(0, -1)
        }
        
        // Check if the directory exists by querying content
        const queryPath = newPath === '/' ? '' : newPath
        const files = await queryContent(queryPath).find()
        
        // Check if there are any files or subdirectories in this path
        const hasContent = files && files.length > 0
        
        if (!hasContent && newPath !== '/') {
            return `cd: ${targetPath}: No such file or directory`
        }
        
        setCurrentDirectory(newPath)
        return ''
    } catch (error) {
        return `cd: ${targetPath}: No such file or directory`
    }
}