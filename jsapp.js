document.addEventListener('DOMContentLoaded', function() {
    // DOM elementos
    const dropArea = document.getElementById('drop-area');
    const fileElem = document.getElementById('fileElem');
    const fileSelector = document.getElementById('file-selector');
    const fileCount = document.getElementById('file-count');
    const fileListContainer = document.getElementById('file-list-container');
    const previewContainer = document.getElementById('preview-container');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    // Variáveis de estado da aplicação
    let files = []; // Array para armazenar os arquivos
    
    // Configurar manipuladores de eventos
    setupEventListeners();
    setupAccordion();
    
    // Função para configurar os listeners de eventos
    function setupEventListeners() {
        // Eventos para arrastar e soltar
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });
        
        // Evento para soltar arquivos
        dropArea.addEventListener('drop', handleDrop, false);
        
        // Botão seletor de arquivos
        fileSelector.addEventListener('click', () => fileElem.click());
        fileElem.addEventListener('change', handleFiles);
        
        // Botão de download
        downloadBtn.addEventListener('click', handleDownload);
        
        // Botão reset
        resetBtn.addEventListener('click', resetApp);
        
        // Eventos de mudança para atualizar a prévia
        document.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', updatePreview);
            if (input.type === 'text' || input.type === 'number') {
                input.addEventListener('input', updatePreview);
            }
        });
        
        // Configurar testador de regex
        document.getElementById('search-pattern').addEventListener('input', updateRegexTest);
    }
    
    // Configurar comportamento de acordeão
    function setupAccordion() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', function() {
                const item = this.parentElement;
                const isActive = item.classList.contains('active');
                
                // Fechar todos os itens
                document.querySelectorAll('.accordion-item').forEach(accordionItem => {
                    accordionItem.classList.remove('active');
                });
                
                // Abrir o clicado (se não estava ativo)
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }
    
    // Funções de utilidade
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    // Manipular soltar arquivos
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const newFiles = [...dt.files];
        
        if (newFiles && newFiles.length > 0) {
            handleFileList(newFiles);
        }
    }
    
    // Manipular seleção de arquivos
    function handleFiles(e) {
        const newFiles = [...e.target.files];
        
        if (newFiles && newFiles.length > 0) {
            handleFileList(newFiles);
        }
    }
    
    // Processar lista de arquivos
    function handleFileList(newFiles) {
        // Adicionar novos arquivos à lista existente
        files = [...files, ...newFiles];
        
        // Atualizar contagem e lista
        updateFileList();
        
        // Gerar prévia
        updatePreview();
        
        // Habilitar botão de download
        downloadBtn.disabled = files.length === 0;
    }
    
    // Atualizar lista de arquivos
    function updateFileList() {
        fileCount.textContent = files.length;
        fileListContainer.innerHTML = '';
        
        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = file.name;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-file';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', () => removeFile(index));
            
            fileItem.appendChild(fileName);
            fileItem.appendChild(removeBtn);
            fileListContainer.appendChild(fileItem);
        });
    }
    
    // Remover um arquivo da lista
    function removeFile(index) {
        files.splice(index, 1);
        updateFileList();
        updatePreview();
        downloadBtn.disabled = files.length === 0;
    }
    
    // Atualizar prévia de nomes
    function updatePreview() {
        if (files.length === 0) {
            previewContainer.innerHTML = '<p>Nenhum arquivo selecionado</p>';
            return;
        }
        
        // Coletar configurações
        const config = collectConfig();
        
        // Processar nomes de arquivos
        const processedFiles = files.map(file => {
            const fileObj = {
                originalFile: file,
                originalName: file.name,
                newName: file.name
            };
            
            // Processar com regex
            if (config.useRegex && config.searchPattern) {
                fileObj.newName = regexHelper.replaceWithRegex(
                    fileObj.newName,
                    config.searchPattern,
                    config.replacePattern
                );
            }
            
            // Extrair com padrões
            if (config.useExtraction && config.extractionPattern) {
                fileObj.newName = regexHelper.extractWithPattern(
                    fileObj.newName,
                    config.extractionPattern,
                    config.outputTemplate
                );
            }
            
            // Adicionar prefixo/sufixo
            if (config.prefix || config.suffix) {
                fileObj.newName = fileProcessor.addPrefixSuffix(
                    fileObj.newName,
                    config.prefix,
                    config.suffix,
                    config.allowReference
                );
            }
            
            // Formatar texto
            if (config.caseOption) {
                switch(config.caseOption) {
                    case 'lowercase':
                        fileObj.newName = fileObj.newName.toLowerCase();
                        break;
                    case 'uppercase':
                        fileObj.newName = fileObj.newName.toUpperCase();
                        break;
                    case 'capitalize':
                        fileObj.newName = fileObj.newName.replace(/\w\S*/g, 
                            txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                        );
                        break;
                }
            }
            
            // Remover espaços ou substituí-los
            if (config.removeSpaces || config.replaceSpaces) {
                if (config.removeSpaces) {
                    fileObj.newName = fileObj.newName.replace(/\s+/g, '');
                } else if (config.replaceSpaces) {
                    fileObj.newName = fileObj.newName.replace(/\s+/g, config.replaceSpaces);
                }
            }
            
            // Remover acentos
            if (config.removeAccents) {
                fileObj.newName = fileObj.newName.normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');
            }
            
            return fileObj;
        });
        
        // Aplicar numeração sequencial
        let filesForDisplay = processedFiles;
        if (config.useSequentialNumbering) {
            filesForDisplay = sequentialNumbering.applyNumbering(
                processedFiles,
                config.startNumber,
                config.increment,
                config.numberFormat,
                config.padding,
                config.separator,
                config.sortBy
            );
        }
        
        // Exibir prévia
        previewContainer.innerHTML = '';
        
        filesForDisplay.forEach(file => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            
            const original = document.createElement('div');
            original.className = 'preview-original';
            original.textContent = file.originalName;
            
            const arrow = document.createElement('div');
            arrow.className = 'preview-arrow';
            arrow.innerHTML = '<i class="fas fa-arrow-right"></i>';
            
            const newName = document.createElement('div');
            newName.className = 'preview-new';
            newName.textContent = file.newName;
            
            previewItem.appendChild(original);
            previewItem.appendChild(arrow);
            previewItem.appendChild(newName);
            previewContainer.appendChild(previewItem);
        });
    }
    
    // Coletar todas as configurações da interface
    function collectConfig() {
        return {
            useRegex: document.getElementById('use-regex').checked,
            searchPattern: document.getElementById('search-pattern').value,
            replacePattern: document.getElementById('replace-pattern').value,
            
            prefix: document.getElementById('prefix').value,
            suffix: document.getElementById('suffix').value,
            allowReference: document.getElementById('allow-reference').checked,
            
            caseOption: document.querySelector('input[name="case"]:checked')?.value || '',
removeSpaces: document.getElementById('remove-spaces').checked,
            replaceSpaces: document.getElementById('replace-spaces').value,
            removeAccents: document.getElementById('remove-accents').checked,
            
            useSequentialNumbering: document.getElementById('start-number').value !== '',
            startNumber: parseInt(document.getElementById('start-number').value) || 1,
            increment: parseInt(document.getElementById('increment').value) || 1,
            numberFormat: document.getElementById('number-format').value,
            padding: parseInt(document.getElementById('padding').value) || 3,
            separator: document.getElementById('separator').value || '_',
            sortBy: document.getElementById('sort-by').value,
            
            useExtraction: document.getElementById('use-extraction').checked,
            extractionPattern: document.getElementById('extraction-pattern').value,
            outputTemplate: document.getElementById('output-template').value
        };
    }
    
    // Download arquivos renomeados
    function handleDownload() {
        if (files.length === 0) return;
        
        const config = collectConfig();
        const processedFiles = fileProcessor.processFiles(files, config);
        
        // Gerar arquivo ZIP se houver mais de um arquivo
        if (processedFiles.length > 1) {
            fileProcessor.downloadAsZip(processedFiles);
        } else {
            fileProcessor.downloadSingleFile(processedFiles[0]);
        }
    }
    
    // Resetar aplicativo
    function resetApp() {
        // Limpar arquivos
        files = [];
        updateFileList();
        
        // Resetar formulários
        document.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
            input.value = '';
        });
        
        document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
            input.checked = false;
        });
        
        // Resetar campos específicos para valores padrão
        document.getElementById('start-number').value = '1';
        document.getElementById('increment').value = '1';
        document.getElementById('padding').value = '3';
        document.getElementById('separator').value = '_';
        document.getElementById('sort-by').value = 'name';
        document.getElementById('number-format').value = 'prefix';
        
        // Atualizar UI
        updatePreview();
        downloadBtn.disabled = true;
    }
    
    // Atualizar teste de regex
    function updateRegexTest() {
        const patternField = document.getElementById('search-pattern');
        const replaceField = document.getElementById('replace-pattern');
        const testResultElement = document.getElementById('regex-test-result');
        
        if (!patternField.value) {
            testResultElement.textContent = 'Insira um padrão regex para teste';
            return;
        }
        
        try {
            const testString = "exemplo_123.jpg";
            const pattern = new RegExp(patternField.value, 'g');
            const replacement = replaceField.value || "$&";
            
            const result = testString.replace(pattern, replacement);
            
            if (result === testString) {
                testResultElement.textContent = `Nenhuma correspondência em "${testString}"`;
            } else {
                testResultElement.innerHTML = `"${testString}" → "${result}"`;
            }
        } catch (e) {
            testResultElement.textContent = `Erro: ${e.message}`;
        }
    }
});
4. js/fileProcessor.js
Copyclass FileProcessor {
    constructor() {
        // Carregar JSZip para compactação
        this.loadJSZip();
    }
    
    // Carregar JSZip dinamicamente
    loadJSZip() {
        if (window.JSZip) return;

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.async = true;
        document.head.appendChild(script);
    }

    // Processar lista de arquivos com configurações
    processFiles(files, config) {
        let processedFiles = files.map(file => {
            return {
                originalFile: file,
                originalName: file.name,
                newName: file.name
            };
        });
        
        // Aplicar regex substituição
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
        if (config.useExtraction && config.extractionPattern && config.outputTemplate) {
            processedFiles = processedFiles.map(fileObj => {
                fileObj.newName = regexHelper.extractWithPattern(
                    fileObj.newName,
                    config.extractionPattern,
                    config.outputTemplate
                );
                return fileObj;
            });
        }
        
        // Adicionar prefixo/sufixo
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
                        fileObj.newName = fileObj.newName.replace(/\w\S*/g, 
                            txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                        );
                        break;
                }
                return fileObj;
            });
        }
        
        // Lidar com espaços
        if (config.removeSpaces || config.replaceSpaces) {
            processedFiles = processedFiles.map(fileObj => {
                if (config.removeSpaces) {
                    fileObj.newName = fileObj.newName.replace(/\s+/g, '');
                } else if (config.replaceSpaces) {
                    fileObj.newName = fileObj.newName.replace(/\s+/g, config.replaceSpaces);
                }
                return fileObj;
            });
        }
        
        // Remover acentos
        if (config.removeAccents) {
            processedFiles = processedFiles.map(fileObj => {
                fileObj.newName = fileObj.newName.normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');
                return fileObj;
            });
        }
        
        // Aplicar numeração sequencial
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

    // Adicionar prefixo e sufixo aos nomes de arquivo
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
        
        // Processar substituições de referência se necessário
        let processedPrefix = prefix;
        let processedSuffix = suffix;
        
        if (allowReference) {
            // Manter as últimas referências do regex
            if (window.lastCaptures && window.lastCaptures.length > 0) {
                processedPrefix = regexHelper.replaceReferences(prefix, window.lastCaptures);
                processedSuffix = regexHelper.replaceReferences(suffix, window.lastCaptures);
            }
        }
        
        // Aplicar prefixo e sufixo
        let newName = name;
        if (processedPrefix) newName = processedPrefix + newName;
        if (processedSuffix) newName = newName + processedSuffix;
        
        return newName + extension;
    }

    // Download de um único arquivo
    downloadSingleFile(fileObj) {
        const blob = new Blob([fileObj.originalFile], { type: fileObj.originalFile.type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = fileObj.newName;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }

    // Download de múltiplos arquivos como ZIP
    async downloadAsZip(filesObj) {
        if (!window.JSZip) {
            alert('Carregando biblioteca de compressão... Tente novamente em alguns segundos.');
            this.loadJSZip();
            return;
        }
        
        const zip = new JSZip();
        
        // Adicionar arquivos ao ZIP
        for (const fileObj of filesObj) {
            const fileContent = await this.readFileAsArrayBuffer(fileObj.originalFile);
            zip.file(fileObj.newName, fileContent);
        }
        
        // Gerar ZIP e fazer download
        const content = await zip.generateAsync({type: 'blob'});
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = 'arquivos_renomeados.zip';
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }

    // Ler arquivo como ArrayBuffer
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
}