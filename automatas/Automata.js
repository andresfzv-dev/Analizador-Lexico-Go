/**
 * Clase base abstracta para todos los autómatas finitos deterministas.
 * Define la estructura común que deben seguir todos los autómatas del analizador léxico.
 * 
 * @abstract
 * @class Automata
 */
export class Automata {
    /**
     * Crea una instancia del autómata
     * @param {string} categoria - Categoría del token que reconoce este autómata
     */
    constructor(categoria) {
        if (this.constructor === Automata) {
            throw new Error("No se puede instanciar una clase abstracta");
        }
        this.categoria = categoria;
    }

    /**
     * Intenta reconocer un token en la entrada desde la posición actual.
     * Este método debe ser implementado por cada autómata específico.
     * 
     * @abstract
     * @param {string} entrada - Cadena de entrada completa
     * @param {number} posicionInicial - Posición inicial en la cadena
     * @returns {{exito: boolean, lexema: string, longitud: number, error?: string}} 
     *          Resultado del reconocimiento
     */
    reconocer(entrada, posicionInicial) {
        throw new Error("El método reconocer() debe ser implementado");
    }

    /**
     * Verifica si un carácter es un espacio en blanco
     * @protected
     * @param {string} caracter - Carácter a verificar
     * @returns {boolean} true si es espacio en blanco
     */
    esEspacioEnBlanco(caracter) {
        return /\s/.test(caracter);
    }

    /**
     * Verifica si un carácter es un dígito
     * @protected
     * @param {string} caracter - Carácter a verificar
     * @returns {boolean} true si es dígito
     */
    esDigito(caracter) {
        return /[0-9]/.test(caracter);
    }

    /**
     * Verifica si un carácter es una letra
     * @protected
     * @param {string} caracter - Carácter a verificar
     * @returns {boolean} true si es letra
     */
    esLetra(caracter) {
        return /[a-zA-Z]/.test(caracter);
    }

    /**
     * Verifica si un carácter es alfanumérico
     * @protected
     * @param {string} caracter - Carácter a verificar
     * @returns {boolean} true si es alfanumérico
     */
    esAlfanumerico(caracter) {
        return /[a-zA-Z0-9]/.test(caracter);
    }

    /**
     * Verifica si estamos al final de la entrada
     * @protected
     * @param {string} entrada - Cadena de entrada
     * @param {number} pos - Posición actual
     * @returns {boolean} true si estamos al final
     */
    esFinDeEntrada(entrada, pos) {
        return pos >= entrada.length;
    }

    /**
     * Obtiene el carácter en una posición específica
     * @protected
     * @param {string} entrada - Cadena de entrada
     * @param {number} pos - Posición
     * @returns {string|null} Carácter en la posición o null si está fuera de límites
     */
    caracterEn(entrada, pos) {
        return pos < entrada.length ? entrada[pos] : null;
    }

    /**
     * Crea un resultado exitoso
     * @protected
     * @param {string} lexema - Lexema reconocido
     * @param {number} longitud - Longitud del lexema
     * @returns {{exito: boolean, lexema: string, longitud: number}}
     */
    crearResultadoExitoso(lexema, longitud) {
        return {
            exito: true,
            lexema,
            longitud
        };
    }

    /**
     * Crea un resultado fallido
     * @protected
     * @param {string} [error] - Mensaje de error opcional
     * @returns {{exito: boolean, error?: string}}
     */
    crearResultadoFallido(error = null) {
        const resultado = { exito: false };
        if (error) {
            resultado.error = error;
        }
        return resultado;
    }
}