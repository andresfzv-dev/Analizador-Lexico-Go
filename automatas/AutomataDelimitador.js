import { Automata } from './Automata.js';

/**
 * Autómata para reconocer delimitadores.
 * Incluye paréntesis, llaves, terminal (punto y coma) y separador (coma).
 * 
 * Estados:
 * - q0 (inicial): Esperando delimitador
 * - q1 (aceptación): Delimitador reconocido
 * 
 * @class AutomataDelimitador
 * @extends Automata
 */
export class AutomataDelimitador extends Automata {
    constructor() {
        super('DELIMITADOR');
        
        // Definición de delimitadores por tipo
        this.delimitadores = {
            parentesis: {
                apertura: '(',
                cierre: ')'
            },
            llaves: {
                apertura: '{',
                cierre: '}'
            },
            corchetes: {
                apertura: '[',
                cierre: ']'
            },
            terminal: ';',
            separador: ',',
            punto: '.'
        };

        // Set de todos los delimitadores válidos
        this.delimitadoresValidos = new Set(['(', ')', '{', '}', ';', ',', '[', ']', '.']);
    }

    /**
     * Obtiene la categoría específica del delimitador
     * @private
     * @param {string} delimitador - Delimitador a clasificar
     * @returns {string} Categoría del delimitador
     */
    obtenerCategoriaDelimitador(delimitador) {
        switch (delimitador) {
            case '(':
                return 'PARENTESIS_APERTURA';
            case ')':
                return 'PARENTESIS_CIERRE';
            case '{':
                return 'LLAVE_APERTURA';
            case '}':
                return 'LLAVE_CIERRE';
            case '[':
                return 'CORCHETE_APERTURA';
            case ']':
                return 'CORCHETE_CIERRE';
            case ';':
                return 'TERMINAL';
            case ',':
                return 'SEPARADOR';
            case '.':
            return 'OPERADOR DE ACCESO';
            default:
                return 'DELIMITADOR';
        }
    }

    /**
     * Verifica si un carácter es un delimitador válido
     * @private
     * @param {string} caracter - Carácter a verificar
     * @returns {boolean}
     */
    esDelimitador(caracter) {
        return this.delimitadoresValidos.has(caracter);
    }

    /**
     * Reconoce delimitadores en la entrada
     * @param {string} entrada - Cadena de entrada
     * @param {number} posicionInicial - Posición inicial
     * @returns {{exito: boolean, lexema: string, longitud: number, categoria?: string}}
     */
    reconocer(entrada, posicionInicial) {
        if (this.esFinDeEntrada(entrada, posicionInicial)) {
            return this.crearResultadoFallido();
        }

        const caracter = this.caracterEn(entrada, posicionInicial);
        
        if (!this.esDelimitador(caracter)) {
            return this.crearResultadoFallido();
        }

        const categoria = this.obtenerCategoriaDelimitador(caracter);

        return {
            exito: true,
            lexema: caracter,
            longitud: 1,
            categoria: categoria
        };
    }
}