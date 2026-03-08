import { AutomataEntero } from '../automatas/AutomataEntero.js';
import { AutomataDecimal } from '../automatas/AutomataDecimal.js';
import { AutomataIdentificador } from '../automatas/AutomataIdentificador.js';
import { AutomataOperador } from '../automatas/AutomataOperador.js';
import { AutomataDelimitador } from '../automatas/AutomataDelimitador.js';
import { AutomataCadena } from '../automatas/AutomataCadena.js';
import { AutomataComentario } from '../automatas/AutomataComentario.js';

/**
 * Clase principal del analizador léxico.
 * Coordina todos los autómatas y realiza el análisis léxico del código fuente.
 * 
 * @class AnalizadorLexico
 */
export class AnalizadorLexico {
    constructor() {
        // Inicializar todos los autómatas en orden de prioridad
        this.automatas = [
            new AutomataComentario(),      // Primero comentarios para evitar conflictos
            new AutomataCadena(),          // Luego cadenas
            new AutomataDecimal(),         // Decimales antes que enteros
            new AutomataEntero(),          // Números enteros
            new AutomataIdentificador(),   // Identificadores y palabras reservadas
            new AutomataOperador(),        // Operadores
            new AutomataDelimitador()      // Delimitadores
        ];
    }

    /**
     * Verifica si un carácter es un espacio en blanco
     * @private
     * @param {string} caracter - Carácter a verificar
     * @returns {boolean}
     */
    esEspacioEnBlanco(caracter) {
        return /\s/.test(caracter);
    }

    /**
     * Salta espacios en blanco y retorna la nueva posición
     * @private
     * @param {string} entrada - Cadena de entrada
     * @param {number} pos - Posición actual
     * @returns {number} Nueva posición después de saltar espacios
     */
    saltarEspaciosEnBlanco(entrada, pos) {
        while (pos < entrada.length && this.esEspacioEnBlanco(entrada[pos])) {
            pos++;
        }
        return pos;
    }

    /**
     * Calcula la línea y columna de una posición en el texto
     * @private
     * @param {string} entrada - Cadena de entrada completa
     * @param {number} pos - Posición absoluta
     * @returns {{linea: number, columna: number}}
     */
    obtenerLineaYColumna(entrada, pos) {
        let linea = 1;
        let columna = 1;

        for (let i = 0; i < pos && i < entrada.length; i++) {
            if (entrada[i] === '\n') {
                linea++;
                columna = 1;
            } else {
                columna++;
            }
        }

        return { linea, columna };
    }

    /**
     * Realiza el análisis léxico completo del código fuente
     * @param {string} codigoFuente - Código fuente a analizar
     * @returns {{tokens: Array, errores: Array, estadisticas: Object}}
     */
    analizar(codigoFuente) {
        const tokens = [];
        const errores = [];
        let pos = 0;
        let idToken = 1;

        while (pos < codigoFuente.length) {
            // Saltar espacios en blanco
            pos = this.saltarEspaciosEnBlanco(codigoFuente, pos);

            if (pos >= codigoFuente.length) {
                break;
            }

            // Calcular posición actual (línea y columna)
            const posicion = this.obtenerLineaYColumna(codigoFuente, pos);
            
            // Intentar reconocer un token con cada autómata
            let tokenReconocido = false;

            for (const automata of this.automatas) {
                const resultado = automata.reconocer(codigoFuente, pos);

                if (resultado.exito) {
                    const token = {
                        id: idToken++,
                        lexema: resultado.lexema,
                        categoria: resultado.categoria || automata.categoria,
                        linea: posicion.linea,
                        columna: posicion.columna
                    };

                    // Si hay un error en el resultado, agregarlo a la lista de errores
                    if (resultado.error) {
                        errores.push({
                            mensaje: resultado.error,
                            lexema: resultado.lexema,
                            linea: posicion.linea,
                            columna: posicion.columna
                        });
                        token.tieneError = true;
                    }

                    tokens.push(token);
                    pos += resultado.longitud;
                    tokenReconocido = true;
                    break;
                }
            }

            // Si ningún autómata reconoció el token
            if (!tokenReconocido) {
                const caracterNoReconocido = codigoFuente[pos];
                const codigoCaracter = caracterNoReconocido.charCodeAt(0);
                
                errores.push({
                    mensaje: `Token no reconocido: '${caracterNoReconocido}' (código: ${codigoCaracter})`,
                    lexema: caracterNoReconocido,
                    linea: posicion.linea,
                    columna: posicion.columna
                });

                tokens.push({
                    id: idToken++,
                    lexema: caracterNoReconocido,
                    categoria: 'ERROR',
                    linea: posicion.linea,
                    columna: posicion.columna,
                    tieneError: true
                });

                pos++;
            }
        }

        // Calcular estadísticas
        const estadisticas = this.calcularEstadisticas(tokens, errores);

        return {
            tokens,
            errores,
            estadisticas
        };
    }

    /**
     * Calcula estadísticas del análisis
     * @private
     * @param {Array} tokens - Lista de tokens
     * @param {Array} errores - Lista de errores
     * @returns {Object} Estadísticas
     */
    calcularEstadisticas(tokens, errores) {
        const categorias = new Set();
        
        tokens.forEach(token => {
            if (token.categoria !== 'ERROR') {
                categorias.add(token.categoria);
            }
        });

        return {
            totalTokens: tokens.length,
            totalErrores: errores.length,
            totalCategorias: categorias.size,
            categoriasEncontradas: Array.from(categorias).sort()
        };
    }

    /**
     * Formatea los resultados para visualización en tabla
     * @param {Object} resultadoAnalisis - Resultado del análisis
     * @returns {Array} Tokens formateados
     */
    formatearResultados(resultadoAnalisis) {
        return resultadoAnalisis.tokens.map(token => ({
            ...token,
            categoriaVisualizacion: this.formatearCategoria(token.categoria)
        }));
    }

    /**
     * Formatea el nombre de una categoría para visualización
     * @private
     * @param {string} categoria - Categoría a formatear
     * @returns {string} Categoría formateada
     */
    formatearCategoria(categoria) {
        return categoria
            .split('_')
            .map(palabra => palabra.charAt(0) + palabra.slice(1).toLowerCase())
            .join(' ');
    }
}