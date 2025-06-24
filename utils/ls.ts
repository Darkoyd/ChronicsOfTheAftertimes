const formatFileSize = (bytes: number, humanReadable: boolean = false): string => {
    if (!humanReadable) {
        return bytes.toString()
    }
    
    const units = ['B', 'K', 'M', 'G', 'T']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
    }
    
    return `${Math.round(size * 10) / 10}${units[unitIndex]}`
}

const formatDate = (date: Date): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[date.getMonth()]
    const day = date.getDate().toString().padStart(2, ' ')
    const time = date.toTimeString().slice(0, 5)
    
    return `${month} ${day} ${time}`
}

const parseFlags = (args: string[]) => {
    let hasLongFormat = false
    let hasHumanReadable = false
    
    args.forEach(arg => {
        if (arg.startsWith('-')) {
            // Handle combined flags like -lh, -hl, etc.
            const flags = arg.slice(1) // Remove the '-'
            if (flags.includes('l')) hasLongFormat = true
            if (flags.includes('h')) hasHumanReadable = true
        }
    })
    
    return { hasLongFormat, hasHumanReadable }
}

export default async (args: string[] = []) => {
    try {
        const { hasLongFormat, hasHumanReadable } = parseFlags(args)
        
        // Get current directory from cd utility
        const { useDirectory } = await import('./cd')
        const { getCurrentDirectory } = useDirectory()
        const currentPath = getCurrentDirectory()
        
        // Get all files from content
        const allFiles = await queryContent().only(['_path', 'createdAt', 'updatedAt']).find()
        
        if (!allFiles || allFiles.length === 0) {
            return 'No files found'
        }
        
        // Find items in current directory
        const items = new Set<string>()
        const fileMap = new Map<string, any>()
        
        allFiles.forEach((file: any) => {
            let relativePath = file._path
            
            // Handle root directory
            if (currentPath === '/') {
                relativePath = file._path.startsWith('/') ? file._path.slice(1) : file._path
            } else {
                // Handle subdirectories
                const prefix = currentPath + '/'
                if (file._path.startsWith(prefix)) {
                    relativePath = file._path.slice(prefix.length)
                } else if (file._path === currentPath) {
                    return // Skip the directory itself
                } else {
                    return // Not in current directory
                }
            }
            
            if (relativePath) {
                const pathParts = relativePath.split('/')
                const itemName = pathParts[0]
                
                if (itemName && itemName !== 'index') {
                    items.add(itemName)
                    
                    // If this is a direct file (not in subdirectory), store the file info
                    if (pathParts.length === 1) {
                        fileMap.set(itemName, file)
                    }
                }
            }
        })
        
        // Convert to sorted array with metadata
        const sortedItems = Array.from(items).map(item => {
            const file = fileMap.get(item)
            const isDirectory = !file // If no direct file, it's a directory
            
            return {
                name: item,
                isDirectory,
                file
            }
        }).sort((a, b) => a.name.localeCompare(b.name))
        
        if (sortedItems.length === 0) {
            return 'No files found'
        }
        
        if (!hasLongFormat) {
            return sortedItems
                .map(item => item.name)
                .join('\n')
        }
        
        // Long format (-l flag)
        return sortedItems
            .map(item => {
                const fileSize = item.isDirectory ? 4096 : Math.floor(Math.random() * 10000) + 1000
                const formattedSize = formatFileSize(fileSize, hasHumanReadable)
                const date = item.file?.updatedAt ? new Date(item.file.updatedAt) : new Date()
                const formattedDate = formatDate(date)
                const permissions = item.isDirectory ? 'drwxr-xr-x' : '-rw-r--r--'
                
                return `${permissions} 1 user user ${formattedSize.toString().padStart(8)} ${formattedDate} ${item.name}`
            })
            .join('\n')
    } catch (error) {
        return `Error reading content folder: ${error.message}`
    }
}