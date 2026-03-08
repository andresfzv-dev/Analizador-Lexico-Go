import { Automata } from './Automata.js';

/**
 * Autómata para reconocer operadores de GO.
 * Incluye operadores aritméticos, de comparación, lógicos, de asignación y de incremento/decremento.
 * 
 * Categorías de operadores:
 * - Aritméticos: +, -, *, /, %
 * - Comparación: ==, !=, <, >, <=, >=
 * - Lógicos: &&, ||, !
 * - Asignación: =, :=, +=, -=, *=, /=, %=
 * - Incremento/Decremento: ++, --
 * 
 * Estados:
 * - q0 (inicial): Esperando primer carácter del operador
 * - q1 (aceptación): Operador de un carácter reconocido
 * - q2 (aceptación): Operador de dos caracteres reconocido
 * 
 * @class AutomataOperador
 * @extends Automata
 */
export class AutomataOperador extends Automata {
    constructor() {
        super('OPERADOR');
        
        // Operadores de un carácter
        this.operadoresSimples = {
            '+': 'OPERADOR_ARITMETICO',
            '-': 'OPERADOR_ARITMETICO',
            '*': 'OPERADOR_ARITMETICO',
            '/': 'OPERADOR_ARITMETICO',
            '%': 'OPERADOR_ARITMETICO',
            '=': 'OPERADOR_ASIGNACION',
            '<': 'OPERADOR_COMPARACION',
            '>': 'OPERADOR_COMPARACION',
            '!': 'OPERADOR_LOGICO'
        };
        
        // Operadores de dos caracteres
        this.operadoresCompuestos = {
            '==': 'OPERADOR_COMPARACION',
            '!=': 'OPERADOR_COMPARACION',
            '<=': 'OPERADOR_COMPARACION',
            '>=': 'OPERADOR_COMPARACION',
            '&&': 'OPERADOR_LOGICO',
            '||': 'OPERADOR_LOGICO',
            '++': 'OPERADOR_INC_DEC',
            '--': 'OPERADOR_INC_DEC',
            ':=': 'OPERADOR_ASIGNACION',
            '+=': 'OPERADOR_ASIGNACION',
            '-=': 'OPERADOR_ASIGNACION',
            '*=': 'OPERADOR_ASIGNACION',
            '/=': 'OPERADOR_ASIGNACION',
            '%=': 'OPERADOR_ASIGNACION'
        };
    }

    /**
     * Verifica si un carácter puede iniciar un operador
     * @private
     * @param {string} caracter - Carácter a verificar
     * @returns {boolean}
     */
    puedeIniciarOperador(caracter) {
        return caracter in this.operadoresSimples || caracter === ':' || caracter === '|' || caracter === '&';
    }

    /**
     * Obtiene la categoría de un operador
     * @private
     * @param {string} operador - Operador a clasificar
     * @returns {string|null} Categoría del operador o null si no es válido
     */
    obtenerCategoriaOperador(operador) {
        if (operador in this.operadoresCompuestos) {
            return this.operadoresCompuestos[operador];
        }
        if (operador in this.operadoresSimples) {
            return this.operadoresSimples[operador];
        }
        return null;
    }

    /**
     * Reconoce operadores en la entrada
     * @param {string} entrada - Cadena de entrada
     * @param {number} posicionInicial - Posición inicial
     * @returns {{exito: boolean, lexema: string, longitud: number, categoria?: string}}
     */
    reconocer(entrada, posicionInicial) {
        let pos = posicionInicial;
        let lexema = '';

        // Estado 0: Esperando primer carácter
        if (this.esFinDeEntrada(entrada, pos)) {
            return this.crearResultadoFallido();
        }

        const primerCaracter = this.caracterEn(entrada, pos);
        
        if (!this.puedeIniciarOperador(primerCaracter)) {
            return this.crearResultadoFallido();
        }

        lexema += primerCaracter;
        pos++;

        // Intentar formar un operador de dos caracteres
        if (!this.esFinDeEntrada(entrada, pos)) {
            const segundoCaracter = this.caracterEn(entrada, pos);
            const operadorCompuesto = lexema + segundoCaracter;
            
            // Verificar si es un operador compuesto válido
            const categoriaCompuesta = this.obtenerCategoriaOperador(operadorCompuesto);
            
            if (categoriaCompuesta) {
                return {
                    exito: true,
                    lexema: operadorCompuesto,
                    longitud: 2,
                    categoria: categoriaCompuesta
                };
            }
        }

        // Si no es compuesto, verificar si es un operador simple válido
        const categoriaSimple = this.obtenerCategoriaOperador(lexema);
        
        if (categoriaSimple) {
            return {
                exito: true,
                lexema: lexema,
                longitud: 1,
                categoria: categoriaSimple
            };
        }

        return this.crearResultadoFallido();
    }
}