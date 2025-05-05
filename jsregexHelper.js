class RegexHelper {
    // Substituir texto usando regex
    replaceWithRegex(text, pattern, replacement) {
        if (!pattern) return text;
        
        try {
            const regex = new RegExp(pattern, 'g');
            const result = text.replace(regex, replacement || '');
            
            // Capturar grupos para uso posterior em referências
            const matches = text.match(regex);
            if (matches) {
                const testMatch = new RegExp(pattern);
                const captures = testMatch.exec(text);
                if (captures) {
                    window.lastCaptures = captures;
                }
            }
            
            return result;
        } catch (e) {
            console.error('Erro ao aplicar regex:', e);
            return text;
        }
    }
    
    // Extrair partes do texto usando um padrão e remontar com template
    extractWithPattern(text, pattern, template) {
        if (!pattern || !template) return text;
        
        try {
            const regex = new RegExp(pattern);
            const matches = regex.exec(text);
            
            if (!matches) return text;
            
            // Salvar capturas para uso em outras partes
            window.lastCaptures = matches;
            
            // Obter nome e extensão
            const lastDotIndex = text.lastIndexOf('.');
            let extension = '';
            
            if (lastDotIndex !== -1) {
                extension = text.substring(lastDotIndex);
            }
            
            // Substituir referências no template
            let result = this.replaceReferences(template, matches);
            
            // Garantir que a extensão seja preservada
            if (extension && !result.endsWith(extension)) {
                result += extension;
            }
            
            return result;
        } catch (e) {
            console.error('Erro ao extrair com padrão:', e);
            return text;
        }
    }
    
    // Substituir referências de grupo ($1, $2, etc.) em um texto
    replaceReferences(text, captures) {
        if (!text || !captures || captures.length === 0) return text;
        
        let result = text;
        for (let i = 1; i < captures.length; i++) {
            const placeholder = `$${i}`;
            const value = captures[i] || '';
            result = result.replace(new RegExp('\\' + placeholder, 'g'), value);
        }
        
        return result;
    }
    
    // Testar um padrão regex em uma string
    testPattern(pattern, text) {
        if (!pattern) return { success: false, message: 'Padrão vazio' };
        
        try {
            const regex = new RegExp(pattern);
            const matches = regex.exec(text);
            
            if (!matches) {
                return { success: false, message: 'Sem correspondências' };
            }
            
            const groups = [];
            for (let i = 1; i < matches.length; i++) {
                groups.push({ index: i, value: matches[i] });
            }
            
            return {
                success: true,
                fullMatch: matches[0],
                groups: groups
            };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }
    
    // Validar um padrão regex
    validateRegex(pattern) {
        if (!pattern) return false;
        
        try {
            new RegExp(pattern);
            return true;
        } catch (e) {
            return false;
        }
    }
}