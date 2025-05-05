class FileProcessor {
    constructor() {
        // JSZip já está incluído no HTML
    }
    
    // Processar arquivos usando as configurações
    processFiles(files, config) {
        let processedFiles = files.map(file => {
            return {
                originalFile: file,
                originalName: file.name,
                newName: file.name
            };
        });
        
        // Aplicar regex se ativado
        if (config.useRegex && config.searchPattern) {
            processedFiles = processedFiles.map(fileObj => {
                fileObj.newName = regexHelper.replaceWithRegex(
                    fileObj.newName, 
                    config.searchPattern, 
                    config.replacePattern
                );
                return fileObj;
            });
        }
        
        // Aplicar extração de padrões
        if (config.useExtraction && config.extractionPattern) {
            processedFiles = processedFiles.map(fileObj => {
                fileObj.newName = regexHelper.extractWithPattern(
                    fileObj.newName,
                    config.extractionPattern,
                    config.outputTemplate
                );
                return fileObj;
            });
        }
        
        // Adicionar prefixo e sufixo
        if (config.prefix || config.suffix) {
            processedFiles = processedFiles.map(fileObj => {
                fileObj.newName = this.addPrefixSuffix(
                    fileObj.newName,
                    config.prefix,
                    config.suffix,
                    config.allowReference
                );
                return fileObj;
            });
        }
        
        // Formatar texto (caso)
        if (config.caseOption) {
            processedFiles = processedFiles.map(fileObj => {
                switch(config.caseOption) {
                    case 'lowercase':
                        fileObj.newName = fileObj.newName.toLowerCase();
                        break;
                    case 'uppercase':
                        fileObj.newName = fileObj.newName.toUpperCase();
                        break;
                    case 'capitalize':
                        // Primeira letra de cada palavra
                        fileObj.newName = fileObj.newName.replace(/\w\S*/g, function(txt) {
                            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                        });
                        break;
                }
                return fileObj;
            });
        }
        
        // Lidar com espaços
        if (config.removeSpaces) {
            processedFiles = processedFiles.map(fileObj => {
                fileObj.newName = fileObj.newName.replace(/\s+/g, '');
                return fileObj;
            });
        } else if (config.replaceSpaces) {
            processedFiles = processedFiles.map(fileObj => {
                fileObj.newName = fileObj.newName.replace(/\s+/g, config.replaceSpaces);
                return fileObj;
            });
        }
        
        // Remover acentos
        if (config.removeAccents) {
            processedFiles = processedFiles.map(fileObj => {
                fileObj.newName = fileObj.newName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                return fileObj;
            });
        }
        
        // Numeração sequencial
        if (config.useSequentialNumbering) {
            processedFiles = sequentialNumbering.applyNumbering(
                processedFiles,
                config.startNumber,
                config.increment,
                config.numberFormat,
                config.padding,
                config.separator,
                config.sortBy
            );
        }
        
        return processedFiles;
    }
    
    // Adicionar prefixo e sufixo
    addPrefixSuffix(filename, prefix = '', suffix = '', allowReference = false) {
        if (!prefix && !suffix) return filename;
        
        // Separar nome e extensão
        const lastDotIndex = filename.lastIndexOf('.');
        let name, extension;
        
        if (lastDotIndex === -1) {
            name = filename;
            extension = '';
        } else {
            name = filename.substring(0, lastDotIndex);
            extension = filename.substring(lastDotIndex);
        }
        
        // Substituir referências se necessário
        let processedPrefix = prefix;
        let processedSuffix = suffix;
        
        if (allowReference && window.lastCaptures) {
            processedPrefix = regexHelper.replaceReferences(prefix, window.lastCaptures);
            processedSuffix = regexHelper.replaceReferences(suffix, window.lastCaptures);
        }
        
        // Aplicar prefixo e sufixo
        if (processedPrefix) {
            name = processedPrefix + name;
        }
        
        if (processedSuffix) {
            name = name + processedSuffix;
        }
        
        return name + extension;
    }
    
    // Download de um único arquivo
    downloadSingleFile(fileObj) {
        const blob = new Blob([fileObj.originalFile], { type: fileObj.originalFile.type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileObj.newName;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
    
    // Download de múltiplos arquivos como ZIP
    async downloadAsZip(filesObj) {
        try {
            const zip = new JSZip();
            
            // Adicionar arquivos ao ZIP
            for (const fileObj of filesObj) {
                const content = await this.readFileAsArrayBuffer(fileObj.originalFile);
                zip.file(fileObj.newName, content);
            }
            
            // Gerar ZIP e fazer download
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'arquivos_renomeados.zip';
            document.body.appendChild(a);
            a.click();
            
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        } catch (error) {
            console.error('Erro ao gerar ZIP:', error);
            alert('Ocorreu um erro ao criar o arquivo ZIP. Por favor, tente novamente.');
        }
    }
    
    // Ler conteúdo do arquivo como ArrayBuffer
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
}