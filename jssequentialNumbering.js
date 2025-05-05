class SequentialNumbering {
    // Aplicar numeração sequencial a uma lista de arquivos
    applyNumbering(files, startNumber = 1, increment = 1, format = 'prefix', 
                   padding = 3, separator = '_', sortBy = 'name') {
        
        if (!files || files.length === 0) return files;
        
        // Criar cópia para não modificar o array original
        const filesCopy = [...files];
        
        // Ordenar arquivos pelo critério especificado
        this.sortFiles(filesCopy, sortBy);
        
        // Aplicar numeração
        let currentNumber = parseInt(startNumber);
        const incrementValue = parseInt(increment);
        
        return filesCopy.map(fileObj => {
            // Formatar número com zeros à esquerda
            const paddedNumber = currentNumber.toString().padStart(padding, '0');
            
            // Separar nome e extensão
            const lastDotIndex = fileObj.newName.lastIndexOf('.');
            let name, extension;
            
            if (lastDotIndex === -1) {
                name = fileObj.newName;
                extension = '';
            } else {
                name = fileObj.newName.substring(0, lastDotIndex);
                extension = fileObj.newName.substring(lastDotIndex);
            }
            
            // Aplicar número conforme formato
            if (format === 'prefix') {
                fileObj.newName = paddedNumber + separator + name + extension;
            } else if (format === 'suffix') {
                fileObj.newName = name + separator + paddedNumber + extension;
            }
            
            // Incrementar para o próximo arquivo
            currentNumber += incrementValue;
            
            return fileObj;
        });
    }
    
    // Ordenar arquivos por diferentes critérios
    sortFiles(files, sortBy) {
        switch (sortBy) {
            case 'name':
                files.sort((a, b) => a.originalName.localeCompare(b.originalName));
                break;
                
            case 'date':
                files.sort((a, b) => {
                    const dateA = a.originalFile.lastModified || Date.now();
                    const dateB = b.originalFile.lastModified || Date.now();
                    return dateA - dateB;
                });
                break;
                
            case 'size':
                files.sort((a, b) => a.originalFile.size - b.originalFile.size);
                break;
                
            default:
                // Manter a ordem atual
                break;
        }
    }
}