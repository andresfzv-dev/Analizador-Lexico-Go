import { Automata } from './Automata.js';

/**
 * Autómata para reconocer cadenas de caracteres con comillas dobles.
 * Soporta caracteres de escape con backslash (\).
 * Expresión regular: "([^"\\]|\\.)*"
 * 
 * Estados:
 * - q0 (inicial): Esperando comilla de apertura
 * - q1: Dentro de la cadena
 * - q2: Después de backslash (carácter de escape)
 * - q3 (aceptación): Comilla de cierre encontrada
 * 
 * Caracteres de escape soportados: \", \\, \n, \t, \r, etc.
 * 
 * @class AutomataCadena
 * @extends Automata
 */
export class AutomataCadena extends Automata {
    constructor() {
        super('CADENA');
    }

    /**
     * Verifica si un carácter es un escape válido
     * @private
     * @param {string} caracter - Carácter después del backslash
     * @returns {boolean}
     */
    esEscapeValido(caracter) {
        // Escapes comunes en GO: \", \\, \n, \t, \r, \a, \b, \f, \v
        return ['n', 't', 'r', 'a', 'b', 'f', 'v', '"', '\\', '\''].includes(caracter);
    }

    /**
     * Reconoce cadenas de caracteres en la entrada
     * @param {string} entrada - Cadena de entrada
     * @param {number} posicionInicial - Posición inicial
     * @returns {{exito: boolean, lexema: string, longitud: number, error?: string}}
     */
    reconocer(entrada, posicionInicial) {
        let pos = posicionInicial;
        let estado = 0;
        let lexema = '';

        // Estado 0: Esperando comilla de apertura
        if (this.esFinDeEntrada(entrada, pos)) {
            return this.crearResultadoFallido();
        }

        const primerCaracter = this.caracterEn(entrada, pos);
        
        if (primerCaracter !== '"') {
            return this.crearResultadoFallido();
        }

        // Estado 1: Dentro de la cadena
        estado = 1;
        lexema += primerCaracter;
        pos++;

        while (!this.esFinDeEntrada(entrada, pos)) {
            const caracterActual = this.caracterEn(entrada, pos);

            if (estado === 1) {
                // Dentro de la cadena normal
                if (caracterActual === '"') {
                    // Estado 3: Comilla de cierre encontrada
                    lexema += caracterActual;
                    pos++;
                    estado = 3;
                    break;
                } else if (caracterActual === '\\') {
                    // Estado 2: Carácter de escape
                    estado = 2;
                    lexema += caracterActual;
                    pos++;
                } else if (caracterActual === '\n' || caracterActual === '\r') {
                    // Error: salto de línea sin escapar dentro de la cadena
                    return {
                        exito: true,
                        lexema: lexema,
                        longitud: lexema.length,
                        categoria: 'ERROR',
                        error: 'Cadena sin cerrar (salto de línea encontrado)'
                    };
                } else {
                    // Carácter normal dentro de la cadena
                    lexema += caracterActual;
                    pos++;
                }
            } else if (estado === 2) {
                // Después del backslash, esperando carácter a escapar
                lexema += caracterActual;
                pos++;
                estado = 1; // Volver al estado dentro de la cadena
            }
        }

        // Verificar si la cadena se cerró correctamente
        if (estado !== 3) {
            return {
                exito: true,
                lexema: lexema,
                longitud: lexema.length,
                categoria: 'ERROR',
                error: 'Cadena sin cerrar (falta comilla de cierre)'
            };
        }

        return this.crearResultadoExitoso(lexema, lexema.length);
    }
}