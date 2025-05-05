class RegexHelper {
    // Substituir texto usando regex
    replaceWithRegex(text, pattern, replacement) {
        if (!pattern) return text;
        
        try {
            const regex = new RegExp(pattern, 'g');
            const result = text.replace(regex, replacement || '');
            
            // Armazenar capturas para uso posterior
            try {
                const matches = text.match(regex);
                if (matches) {
                    const testRegex = new RegExp(pattern);
                    const captures = testRegex.exec(text);
                    if (captures) {
                        window.lastCaptures = captures;
                    }
                }
            } catch (e) {
                console.error('Erro ao capturar grupos:', e);
            }
            
            return result;
        } catch (e) {
            console.error('Erro ao aplicar regex:', e);
            return text;
        }
    }
    
    // Extrair partes usando padrão e template
    extractWithPattern(text, pattern, template) {
        if (!pattern || !template) return text;
        
        try {
            const regex = new RegExp(pattern);
            const matches = regex.exec(text);
            
            if (!matches) return text;
            
            // Armazenar capturas globalmente
            window.lastCaptures = matches;
            
            // Obter extensão do arquivo
            const lastDotIndex = text.lastIndexOf('.');
            let extension = '';
            
            if (lastDotIndex !== -1) {
                extension = text.substring(lastDotIndex);
            }
            
            // Substituir referências no template
            let result = this.replaceReferences(template, matches);
            
            // Garantir que a extensão seja mantida
            if (extension && !result.endsWith(extension)) {
                result += extension;
            }
            
            return result;
        } catch (e) {
            console.error('Erro ao extrair com padrão:', e);
            return text;
        }
    }
    
    // Substituir referências ($1, $2) em um texto
    replaceReferences(text, captures) {
        if (!text || !captures || captures.length === 0) {
            return text;
        }
        
        let result = text;
        
        // Substituir cada grupo de captura
        for (let i = 1; i < captures.length; i++) {
            const placeholder = `$${i}`;
            const value = captures[i] || '';
            
            // Usar regex para substituir todas as ocorrências
            result = result.replace(new RegExp('\\' + placeholder, 'g'), value);
        }
        
        return result;
    }
    
    // Verificar se um padrão é válido
    isValidPattern(pattern) {
        if (!pattern) return false;
        
        try {
            new RegExp(pattern);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    // Testar um padrão em uma string
    testRegexPattern(pattern, testString) {
        if (!pattern) return null;
        
        try {
            const regex = new RegExp(pattern);
            return testString.match(regex);
        } catch (e) {
            return null;
        }
    }
}