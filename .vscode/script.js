// ==========================
// 🔹 ANALIZADOR LÉXICO (esqueleto)
// ==========================
class LexicalAnalyzer {
    constructor(sourceCode) {
        this.code = sourceCode;
        this.tokens = [];
        this.errors = [];
        this.index = 0;
        this.line = 1;
        this.column = 1;
    }

    getCurrentChar() {
        return this.code[this.index];
    }

    peekChar(offset = 1) {
        return this.code[this.index + offset];
    }

    advance() {
        if (this.getCurrentChar() === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
        this.index++;
    }

    getCurrentPosition() {
        return new Position(this.line, this.column);
    }

    addToken(lexeme, category, position) {
        this.tokens.push(new Token(lexeme, category, position));
    }

    addError(message, position) {
        this.errors.push(new LexicalError(message, position));
    }

    skipWhitespace() {
        while (this.index < this.code.length) {
            const char = this.getCurrentChar();
            if (char === ' ' || char === '\t' || char === '\r' || char === '\n') {
                this.advance();
            } else {
                break;
            }
        }
    }

    // El cuerpo concreto del análisis delega en métodos que se implementan en
    // los archivos `automata_*.js` (scanLineComment, scanBlockComment, scanString,
    // scanCharacter, scanNumber, scanIdentifier, scanOperator).
    analyze() {
        while (this.index < this.code.length) {
            this.skipWhitespace();

            if (this.index >= this.code.length) break;

            const char = this.getCurrentChar();
            const startPos = this.getCurrentPosition();

            if (char === '/' && this.peekChar() === '/') {
                this.scanLineComment();
                continue;
            }

            if (char === '/' && this.peekChar() === '*') {
                this.scanBlockComment();
                continue;
            }

            if (char === '"') {
                this.scanString();
                continue;
            }

            if (char === '\'') {
                this.scanCharacter();
                continue;
            }

            if (isDigit(char)) {
                this.scanNumber();
                continue;
            }

            if (isLetter(char) || char === '_') {
                this.scanIdentifier();
                continue;
            }

            const delimiterMap = {
                '(': 'PARENTESIS_ABRE',
                ')': 'PARENTESIS_CIERRA',
                '{': 'LLAVE_ABRE',
                '}': 'LLAVE_CIERRA',
                '[': 'CORCHETE_ABRE',
                ']': 'CORCHETE_CIERRA',
                ';': 'TERMINAL',
                ',': 'SEPARADOR',
                '.': 'PUNTO',
                ':': 'DOS_PUNTOS'
            };

            if (delimiterMap[char]) {
                this.addToken(char, delimiterMap[char], startPos);
                this.advance();
                continue;
            }

            if ('+-*/%<>=!&|^'.includes(char)) {
                this.scanOperator();
                continue;
            }

            this.addError(`Token no reconocido: '${char}'`, startPos);
            this.advance();
        }

        return {
            tokens: this.tokens,
            errors: this.errors
        };
    }
}

// ==========================
// 🔹 INTERFAZ DE USUARIO
// ==========================
function displayResults(tokens, errors) {
    document.getElementById('tokenCount').textContent = tokens.length;
    document.getElementById('errorCount').textContent = errors.length;

    // Mostrar errores
    const errorPanel = document.getElementById('errorPanel');
    if (errors.length > 0) {
        errorPanel.style.display = 'flex';
        document.getElementById('errorList').innerHTML = errors
            .map(err => `<div class="error-item"><span class="error-position">${err.position}</span> <span class="error-message">${err.message}</span></div>`)
            .join('');
    } else {
        errorPanel.style.display = 'none';
    }

    // Mostrar tokens
    const tokensSection = document.getElementById('tokensSection');
    if (tokens.length > 0) {
        tokensSection.style.display = 'flex';
        document.getElementById('tokensTableBody').innerHTML = tokens.map((t, i) =>
            `<tr>
                <td>${i + 1}</td>
                <td class="lexeme-cell">${escapeHtml(t.lexeme)}</td>
                <td><span class="category-badge">${t.category}</span></td>
                <td class="position-cell">${t.position}</td>
            </tr>`
        ).join('');
    } else {
        tokensSection.style.display = 'none';
    }
    
    // Actualizar estadísticas por categoría
    updateCategoryStats(tokens);
}

function updateCategoryStats(tokens) {
    const stats = {};
    tokens.forEach(token => {
        stats[token.category] = (stats[token.category] || 0) + 1;
    });
    
    // Puedes mostrar estas estadísticas en algún lugar si lo deseas
    console.log('Estadísticas por categoría:', stats);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function analyze() {
    const code = document.getElementById('codeInput').value;
    
    if (!code.trim()) {
        alert('Por favor ingrese código para analizar');
        return;
    }
    
    const analyzer = new LexicalAnalyzer(code);
    const result = analyzer.analyze();
    
    displayResults(result.tokens, result.errors);
}

function loadExample() {
    document.getElementById('codeInput').value = exampleCode;
}

function clearAll() {
    document.getElementById('codeInput').value = '';
    document.getElementById('tokenCount').textContent = '0';
    document.getElementById('errorCount').textContent = '0';
    document.getElementById('errorPanel').style.display = 'none';
    document.getElementById('tokensSection').style.display = 'none';
}

function exportToCSV() {
    const code = document.getElementById('codeInput').value;
    if (!code.trim()) {
        alert('No hay tokens para exportar');
        return;
    }
    
    const analyzer = new LexicalAnalyzer(code);
    const result = analyzer.analyze();
    
    let csv = 'Número,Lexema,Categoría,Posición\n';
    result.tokens.forEach((token, index) => {
        const lexeme = token.lexeme.replace(/"/g, '""');
        csv += `${index + 1},"${lexeme}",${token.category},${token.position}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tokens.csv';
    a.click();
    URL.revokeObjectURL(url);
}

function exportToJSON() {
    const code = document.getElementById('codeInput').value;
    if (!code.trim()) {
        alert('No hay tokens para exportar');
        return;
    }
    
    const analyzer = new LexicalAnalyzer(code);
    const result = analyzer.analyze();
    
    const data = {
        timestamp: new Date().toISOString(),
        totalTokens: result.tokens.length,
        totalErrors: result.errors.length,
        tokens: result.tokens.map((t, i) => ({
            numero: i + 1,
            lexema: t.lexeme,
            categoria: t.category,
            posicion: t.position.toString()
        })),
        errors: result.errors.map(e => ({
            mensaje: e.message,
            posicion: e.position.toString()
        }))
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analisis_lexico.json';
    a.click();
    URL.revokeObjectURL(url);
}

function initCategories() {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = TOKEN_CONFIG.categories
        .map(cat => `<div class="category-item">${cat}</div>`)
        .join('');
}

// ==========================
// 🔹 INICIALIZACIÓN
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    initCategories();
    
    document.getElementById('analyzeBtn').addEventListener('click', analyze);
    document.getElementById('exampleBtn').addEventListener('click', loadExample);
    document.getElementById('clearBtn').addEventListener('click', clearAll);
    
    // Agregar botones de exportación si existen
    const exportCSVBtn = document.getElementById('exportCSVBtn');
    const exportJSONBtn = document.getElementById('exportJSONBtn');
    
    if (exportCSVBtn) exportCSVBtn.addEventListener('click', exportToCSV);
    if (exportJSONBtn) exportJSONBtn.addEventListener('click', exportToJSON);
    
    // Atajo de teclado para analizar (Ctrl+Enter)
    document.getElementById('codeInput').addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            analyze();
        }
    });
});