export default async () => {
    try {
        const files = await queryContent().only(['_path']).find()
        
        if (!files || files.length === 0) {
            return 'No files found in content folder'
        }
        
        return files
            .map((file: any) => {
                const parts = file._path.split('/')
                return parts[parts.length - 1] || file._path
            })
            .filter((filename: string) => filename && filename !== 'index')
            .sort()
            .join('\n')
    } catch (error) {
        return 'Error reading content folder'
    }
}