import { AnalizadorLexico } from './AnalizadorLexico.js';

/**
 * Clase principal de la aplicación que maneja la interfaz de usuario
 * y coordina el análisis léxico.
 * 
 * @class Aplicacion
 */
class Aplicacion {
    constructor() {
        this.analizador = new AnalizadorLexico();
        this.tokensActuales = [];
        this.inicializarElementos();
        this.adjuntarEventListeners();
        this.cargarCodigoEjemplo();
    }

    /**
     * Inicializa referencias a elementos del DOM
     * @private
     */
    inicializarElementos() {
        // Elementos del editor
        this.entradaCodigo = document.getElementById('codeInput');
        this.contadorLineas = document.getElementById('lineCount');
        this.contadorCaracteres = document.getElementById('charCount');

        // Botones
        this.btnAnalizar = document.getElementById('analyzeBtn');
        this.btnLimpiar = document.getElementById('clearBtn');

        // Elementos de resultados
        this.cuerpoTokens = document.getElementById('tokensBody');
        this.contenedorErrores = document.getElementById('errorContainer');
        this.contenedorEstadisticas = document.getElementById('statsContainer');
        this.filtroCategoria = document.getElementById('filterCategory');

        // Elementos de estadísticas
        this.totalTokens = document.getElementById('totalTokens');
        this.totalErrores = document.getElementById('totalErrors');
        this.totalCategorias = document.getElementById('totalCategories');
    }

    /**
     * Adjunta event listeners a los elementos
     * @private
     */
    adjuntarEventListeners() {
        // Evento de análisis
        this.btnAnalizar.addEventListener('click', () => this.manejarAnalisis());

        // Evento de limpiar
        this.btnLimpiar.addEventListener('click', () => this.manejarLimpiar());

        // Evento de cambio en el editor
        this.entradaCodigo.addEventListener('input', () => this.actualizarInfoEditor());

        // Evento de filtro de categorías
        this.filtroCategoria.addEventListener('change', () => this.aplicarFiltro());

        // Permitir análisis con Ctrl+Enter
        this.entradaCodigo.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.manejarAnalisis();
            }
        });
    }

    /**
     * Carga código de ejemplo al iniciar
     * @private
     */
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

    /**
     * Actualiza la información del editor (líneas y caracteres)
     * @private
     */
    actualizarInfoEditor() {
        const texto = this.entradaCodigo.value;
        const lineas = texto.split('\n').length;
        const caracteres = texto.length;

        this.contadorLineas.textContent = `Líneas: ${lineas}`;
        this.contadorCaracteres.textContent = `Caracteres: ${caracteres}`;
    }

    /**
     * Maneja el evento de análisis
     * @private
     */
    manejarAnalisis() {
        const codigoFuente = this.entradaCodigo.value;

        if (!codigoFuente.trim()) {
            this.mostrarEstadoVacio();
            return;
        }

        // Deshabilitar botón durante análisis
        this.btnAnalizar.disabled = true;
        this.btnAnalizar.textContent = 'Analizando...';

        // Simular un pequeño delay para mejor UX
        setTimeout(() => {
            const resultado = this.analizador.analizar(codigoFuente);
            this.tokensActuales = resultado.tokens;
            this.mostrarResultados(resultado);
            
            this.btnAnalizar.disabled = false;
            this.btnAnalizar.textContent = 'Analizar';
        }, 100);
    }

    /**
     * Maneja el evento de limpiar
     * @private
     */
    manejarLimpiar() {
        if (confirm('¿Estás seguro de que deseas limpiar el editor?')) {
            this.entradaCodigo.value = '';
            this.actualizarInfoEditor();
            this.mostrarEstadoVacio();
            this.entradaCodigo.focus();
        }
    }

    /**
     * Muestra los resultados del análisis
     * @private
     * @param {Object} resultado - Resultado del análisis léxico
     */
    mostrarResultados(resultado) {
        this.mostrarTokens(resultado.tokens);
        this.mostrarErrores(resultado.errores);
        this.mostrarEstadisticas(resultado.estadisticas);
    }

    /**
     * Muestra los tokens en la tabla
     * @private
     * @param {Array} tokens - Lista de tokens
     */
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

    /**
     * Crea una fila de la tabla para un token
     * @private
     * @param {Object} token - Token a mostrar
     * @returns {HTMLTableRowElement}
     */
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

    /**
     * Obtiene la clase CSS para una categoría
     * @private
     * @param {string} categoria - Categoría del token
     * @returns {string}
     */
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

    /**
     * Formatea el nombre de una categoría
     * @private
     * @param {string} categoria - Categoría a formatear
     * @returns {string}
     */
    formatearCategoria(categoria) {
        return categoria
            .split('_')
            .map(palabra => palabra.charAt(0) + palabra.slice(1).toLowerCase())
            .join(' ');
    }

    /**
     * Escapa caracteres HTML
     * @private
     * @param {string} texto - Texto a escapar
     * @returns {string}
     */
    escaparHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    /**
     * Muestra los errores encontrados
     * @private
     * @param {Array} errores - Lista de errores
     */
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

    /**
     * Muestra las estadísticas del análisis
     * @private
     * @param {Object} estadisticas - Estadísticas
     */
    mostrarEstadisticas(estadisticas) {
        this.contenedorEstadisticas.style.display = 'grid';
        this.totalTokens.textContent = estadisticas.totalTokens;
        this.totalErrores.textContent = estadisticas.totalErrores;
        this.totalCategorias.textContent = estadisticas.totalCategorias;
    }

    /**
     * Muestra el estado vacío de la tabla
     * @private
     */
    mostrarEstadoVacio() {
        this.cuerpoTokens.innerHTML = `
            <tr class="empty-state">
                <td colspan="5">No hay tokens analizados. Escribe código y presiona "Analizar".</td>
            </tr>
        `;
        this.contenedorErrores.style.display = 'none';
        this.contenedorEstadisticas.style.display = 'none';
    }

    /**
     * Aplica el filtro seleccionado a los tokens
     * @private
     */
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


// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new Aplicacion();
});