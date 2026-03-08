import { AnalizadorLexico } from './AnalizadorLexico.js';

class Aplicacion {
    constructor() {
        this.analizador = new AnalizadorLexico();
        this.tokensActuales = [];
        this.inicializarElementos();
        this.adjuntarEventListeners();
        this.cargarCodigoEjemplo();
    }

    inicializarElementos() {
        this.entradaCodigo = document.getElementById('codeInput');
        this.contadorLineas = document.getElementById('lineCount');
        this.contadorCaracteres = document.getElementById('charCount');
        this.btnAnalizar = document.getElementById('analyzeBtn');
        this.btnLimpiar = document.getElementById('clearBtn');
        this.cuerpoTokens = document.getElementById('tokensBody');
        this.contenedorErrores = document.getElementById('errorContainer');
        this.contenedorEstadisticas = document.getElementById('statsContainer');
        this.filtroCategoria = document.getElementById('filterCategory');
        this.totalTokens = document.getElementById('totalTokens');
        this.totalErrores = document.getElementById('totalErrors');
        this.totalCategorias = document.getElementById('totalCategories');
    }

    adjuntarEventListeners() {
        this.btnAnalizar.addEventListener('click', () => this.manejarAnalisis());
        this.btnLimpiar.addEventListener('click', () => this.manejarLimpiar());
        this.entradaCodigo.addEventListener('input', () => this.actualizarInfoEditor());
        this.filtroCategoria.addEventListener('change', () => this.aplicarFiltro());
        this.entradaCodigo.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.manejarAnalisis();
            }
        });
    }


    cargarCodigoEjemplo() {
        const codigoEjemplo = `package main

import "fmt"

// Función principal
func main() {
    // Declaración de variables
    var nombre string = "Go Language"
    edad := 25
    precio := 99.99
    
    /* Este es un comentario
       de múltiples líneas */
    
    if edad >= 18 {
        fmt.Println("Mayor de edad")
    } else {
        fmt.Println("Menor de edad")
    }
    
    // Operaciones aritméticas
    suma := 10 + 5
    resta := 10 - 5
    multiplicacion := 10 * 5
    division := 10 / 5
    modulo := 10 % 3
    
    // Incremento y decremento
    contador := 0
    contador++
    contador--
    
    // Bucle for
    for i := 0; i < 10; i++ {
        fmt.Println(i)
    }
}`;

        this.entradaCodigo.value = codigoEjemplo;
        this.actualizarInfoEditor();
    }

    actualizarInfoEditor() {
        const texto = this.entradaCodigo.value;
        const lineas = texto.split('\n').length;
        const caracteres = texto.length;

        this.contadorLineas.textContent = `Líneas: ${lineas}`;
        this.contadorCaracteres.textContent = `Caracteres: ${caracteres}`;
    }

    manejarAnalisis() {
        const codigoFuente = this.entradaCodigo.value;

        if (!codigoFuente.trim()) {
            this.mostrarEstadoVacio();
            return;
        }

        this.btnAnalizar.disabled = true;
        this.btnAnalizar.textContent = 'Analizando...';

        setTimeout(() => {
            const resultado = this.analizador.analizar(codigoFuente);
            this.tokensActuales = resultado.tokens;
            this.mostrarResultados(resultado);
            
            this.btnAnalizar.disabled = false;
            this.btnAnalizar.textContent = 'Analizar';
        }, 100);
    }

    manejarLimpiar() {
        if (confirm('¿Estás seguro de que deseas limpiar el editor?')) {
            this.entradaCodigo.value = '';
            this.actualizarInfoEditor();
            this.mostrarEstadoVacio();
            this.entradaCodigo.focus();
        }
    }

    mostrarResultados(resultado) {
        this.mostrarTokens(resultado.tokens);
        this.mostrarErrores(resultado.errores);
        this.mostrarEstadisticas(resultado.estadisticas);
    }

    mostrarTokens(tokens) {
        this.cuerpoTokens.innerHTML = '';

        if (tokens.length === 0) {
            this.mostrarEstadoVacio();
            return;
        }

        tokens.forEach(token => {
            const fila = this.crearFilaToken(token);
            this.cuerpoTokens.appendChild(fila);
        });
    }

    crearFilaToken(token) {
        const fila = document.createElement('tr');
        
        if (token.tieneError) {
            fila.classList.add('error-row');
        }

        const claseCategoria = this.obtenerClaseCategoria(token.categoria);

        fila.innerHTML = `
            <td>${token.id}</td>
            <td><code>${this.escaparHtml(token.lexema)}</code></td>
            <td><span class="category-badge ${claseCategoria}">${this.formatearCategoria(token.categoria)}</span></td>
            <td>${token.linea}</td>
            <td>${token.columna}</td>
        `;

        return fila;
    }

    obtenerClaseCategoria(categoria) {
        const mapaCategorias = {
            'PALABRA_RESERVADA': 'category-keyword',
            'IDENTIFICADOR': 'category-identifier',
            'ENTERO': 'category-number',
            'DECIMAL': 'category-number',
            'OPERADOR_ARITMETICO': 'category-operator',
            'OPERADOR_COMPARACION': 'category-operator',
            'OPERADOR_LOGICO': 'category-operator',
            'OPERADOR_ASIGNACION': 'category-operator',
            'OPERADOR_INC_DEC': 'category-operator',
            'CADENA': 'category-string',
            'COMENTARIO_LINEA': 'category-comment',
            'COMENTARIO_BLOQUE': 'category-comment',
            'PARENTESIS_APERTURA': 'category-delimiter',
            'PARENTESIS_CIERRE': 'category-delimiter',
            'LLAVE_APERTURA': 'category-delimiter',
            'LLAVE_CIERRE': 'category-delimiter',
            'TERMINAL': 'category-delimiter',
            'SEPARADOR': 'category-delimiter',
            'ERROR': 'category-error'
        };

        return mapaCategorias[categoria] || 'category-delimiter';
    }

    formatearCategoria(categoria) {
        return categoria
            .split('_')
            .map(palabra => palabra.charAt(0) + palabra.slice(1).toLowerCase())
            .join(' ');
    }

    escaparHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    mostrarErrores(errores) {
        if (errores.length === 0) {
            this.contenedorErrores.style.display = 'none';
            return;
        }

        this.contenedorErrores.style.display = 'block';
        this.contenedorErrores.innerHTML = '<h3>Errores encontrados:</h3>';

        errores.forEach(error => {
            const divError = document.createElement('div');
            divError.className = 'error-item';
            divError.innerHTML = `
                <span class="error-message">
                    <strong>Línea ${error.linea}, Columna ${error.columna}:</strong> 
                    ${error.mensaje}
                </span>
            `;
            this.contenedorErrores.appendChild(divError);
        });
    }

    mostrarEstadisticas(estadisticas) {
        this.contenedorEstadisticas.style.display = 'grid';
        this.totalTokens.textContent = estadisticas.totalTokens;
        this.totalErrores.textContent = estadisticas.totalErrores;
        this.totalCategorias.textContent = estadisticas.totalCategorias;
    }

    mostrarEstadoVacio() {
        this.cuerpoTokens.innerHTML = `
            <tr class="empty-state">
                <td colspan="5">No hay tokens analizados. Escribe código y presiona "Analizar".</td>
            </tr>
        `;
        this.contenedorErrores.style.display = 'none';
        this.contenedorEstadisticas.style.display = 'none';
    }

    aplicarFiltro() {
        const valorFiltro = this.filtroCategoria.value;

        if (valorFiltro === 'all') {
            this.mostrarTokens(this.tokensActuales);
        } else if (valorFiltro === 'error') {
            const tokensConError = this.tokensActuales.filter(token => token.tieneError);
            this.mostrarTokens(tokensConError);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Aplicacion();
});