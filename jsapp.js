document.addEventListener('DOMContentLoaded', function() {
    // Inicializar objetos
    const regexHelper = new RegexHelper();
    const sequentialNumbering = new SequentialNumbering();
    const fileProcessor = new FileProcessor();
    
    // Variáveis globais
    let files = []; // Array para armazenar arquivos selecionados
    
    // Elementos DOM
    const dropArea = document.getElementById('drop-area');
    const fileSelector = document.getElementById('file-selector');
    const fileElem = document.getElementById('fileElem');
    const fileCount = document.getElementById('file-count');
    const fileListContainer = document.getElementById('file-list-container');
    const previewContainer = document.getElementById('preview-container');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    // Configurar drag-and-drop
    setupDragAndDrop();
    
    // Configurar acordeão das seções
    setupAccordion();
    
    // Configurar eventos
    setupEventListeners();
    
    // Função para configurar eventos de drag-and-drop
    function setupDragAndDrop() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });
        
        dropArea.addEventListener('drop', handleDrop, false);
    }
    
    // Função para configurar acordeão das seções
    function setupAccordion() {
        document.querySelectorAll('.section-header').forEach(header => {
            header.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const isVisible = content.style.display !== 'none';
                
                if (isVisible) {
                    content.style.display = 'none';
                } else {
                    content.style.display = 'block';
                }
            });
        });
    }
    
    // Função para configurar eventos adicionais
    function setupEventListeners() {
        fileSelector.addEventListener('click', () => fileElem.click());
        fileElem.addEventListener('change', handleFiles);
        downloadBtn.addEventListener('click', handleDownload);
        resetBtn.addEventListener('click', resetApp);
        
        // Eventos para inputs que devem atualizar a prévia
        document.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', updatePreview);
            if (input.type === 'text' || input.type === 'number') {
                input.addEventListener('input', updatePreview);
            }
        });
        
        // Configurar testador de regex
        document.getElementById('search-pattern').addEventListener('input', updateRegexTester);
        document.getElementById('replace-pattern').addEventListener('input', updateRegexTester);
    }
    
    // Funções auxiliares para drag-and-drop
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
    
    // Manipular arquivos soltos na área de drop
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files && files.length > 0) {
            handleFiles({ target: { files } });
        }
    }
    
    // Manipular arquivos selecionados
    function handleFiles(e) {
        const selectedFiles = Array.from(e.target.files);
        
        if (selectedFiles && selectedFiles.length > 0) {
            // Adicionar à lista global de arquivos
            files = [...files, ...selectedFiles];
            
            // Atualizar UI
            updateFileList();
            updatePreview();
        }
    }
    
    // Atualizar lista de arquivos na UI
    function updateFileList() {
        // Atualizar contador
        fileCount.textContent = files.length;
        
        // Limpar container
        fileListContainer.innerHTML = '';
        
        if (files.length === 0) {
            downloadBtn.disabled = true;
            return;
        } else {
            downloadBtn.disabled = false;
        }
        
        // Adicionar cada arquivo à lista
        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = file.name;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-file';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', () => {
                files.splice(index, 1);
                updateFileList();
                updatePreview();
            });
            
            fileItem.appendChild(fileName);
            fileItem.appendChild(removeBtn);
            fileListContainer.appendChild(fileItem);
        });
    }
    
    // Atualizar prévia dos nomes
    function updatePreview() {
        if (files.length === 0) {
            previewContainer.innerHTML = '<p>Nenhum arquivo selecionado</p>';
            return;
        }
        
        // Coletar configurações
        const config = getConfig();
        
        // Processar arquivos
        const processedFiles = fileProcessor.processFiles(files, config);
        
        // Atualizar UI
        previewContainer.innerHTML = '';
        
        processedFiles.forEach(file => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            
            const originalName = document.createElement('div');
            originalName.className = 'preview-original';
            originalName.textContent = file.originalName;
            
            const arrow = document.createElement('div');
            arrow.className = 'preview-arrow';
            arrow.innerHTML = '<i class="fas fa-arrow-right"></i>';
            
            const newName = document.createElement('div');
            newName.className = 'preview-new';
            newName.textContent = file.newName;
            
            previewItem.appendChild(originalName);
            previewItem.appendChild(arrow);
            previewItem.appendChild(newName);
            previewContainer.appendChild(previewItem);
        });
    }
    
    // Coletar todas as configurações da UI
    function getConfig() {
        return {
            // Regex
            useRegex: document.getElementById('use-regex').checked,
 searchPattern: document.getElementById('search-pattern').value,
            replacePattern: document.getElementById('replace-pattern').value,
            
            // Prefixo/sufixo
            prefix: document.getElementById('prefix').value,
            suffix: document.getElementById('suffix').value,
            allowReference: document.getElementById('allow-reference').checked,
            
            // Formatação de texto
            caseOption: document.querySelector('input[name="case"]:checked')?.value || '',
            removeSpaces: document.getElementById('remove-spaces').checked,
            replaceSpaces: document.getElementById('replace-spaces').value,
            removeAccents: document.getElementById('remove-accents').checked,
            
            // Numeração sequencial
            useSequentialNumbering: document.getElementById('start-number').value !== '',
            startNumber: parseInt(document.getElementById('start-number').value) || 1,
            increment: parseInt(document.getElementById('increment').value) || 1,
            numberFormat: document.getElementById('number-format').value,
            padding: parseInt(document.getElementById('padding').value) || 3,
            separator: document.getElementById('separator').value || '_',
            sortBy: document.getElementById('sort-by').value,
            
            // Extração com padrões
            useExtraction: document.getElementById('use-extraction').checked,
            extractionPattern: document.getElementById('extraction-pattern').value,
            outputTemplate: document.getElementById('output-template').value
        };
    }
    
    // Atualizar testador de regex
    function updateRegexTester() {
        const pattern = document.getElementById('search-pattern').value;
        const replacement = document.getElementById('replace-pattern').value;
        const resultElement = document.getElementById('regex-test-result');
        
        if (!pattern) {
            resultElement.textContent = 'Resultado aparecerá aqui';
            return;
        }
        
        try {
            const testString = "exemplo_123.jpg";
            const regex = new RegExp(pattern);
            const result = testString.replace(regex, replacement || "$&");
            
            if (result === testString && testString.match(regex)) {
                resultElement.innerHTML = `Correspondência encontrada em "${testString}"<br>Sem alterações: "${result}"`;
            } else if (result === testString) {
                resultElement.textContent = `Nenhuma correspondência em "${testString}"`;
            } else {
                resultElement.innerHTML = `"${testString}" → "${result}"`;
            }
        } catch (e) {
            resultElement.textContent = `Erro: ${e.message}`;
        }
    }
    
    // Processar download
    function handleDownload() {
        if (files.length === 0) return;
        
        const config = getConfig();
        const processedFiles = fileProcessor.processFiles(files, config);
        
        if (files.length === 1) {
            fileProcessor.downloadSingleFile(processedFiles[0]);
        } else {
            fileProcessor.downloadAsZip(processedFiles);
        }
    }
    
    // Resetar aplicativo
    function resetApp() {
        // Limpar arquivos
        files = [];
        updateFileList();
        
        // Resetar formulários
        document.querySelectorAll('input[type="text"]').forEach(input => {
            input.value = '';
        });
        document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
            input.checked = false;
        });
        
        // Resetar valores padrão
        document.getElementById('start-number').value = '1';
        document.getElementById('increment').value = '1';
        document.getElementById('padding').value = '3';
        document.getElementById('separator').value = '_';
        
        // Atualizar UI
        updatePreview();
    }
});