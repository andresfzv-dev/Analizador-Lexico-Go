import { Automata } from './Automata.js';

/**
 * Autómata para reconocer números decimales.
 * Expresión regular: [0-9]+\.[0-9]+
 * 
 * Estados:
 * - q0 (inicial): Esperando primer dígito
 * - q1: Reconociendo dígitos enteros
 * - q2: Esperando punto decimal
 * - q3 (aceptación): Reconociendo dígitos decimales
 * 
 * @class AutomataDecimal
 * @extends Automata
 */
export class AutomataDecimal extends Automata {
    constructor() {
        super('DECIMAL');
    }

    /**
     * Reconoce números decimales en la entrada
     * @param {string} entrada - Cadena de entrada
     * @param {number} posicionInicial - Posición inicial
     * @returns {{exito: boolean, lexema: string, longitud: number}}
     */
    reconocer(entrada, posicionInicial) {
        let pos = posicionInicial;
        let estado = 0;
        let lexema = '';

        // Estado 0: Esperando primer dígito
        if (this.esFinDeEntrada(entrada, pos)) {
            return this.crearResultadoFallido();
        }

        const primerCaracter = this.caracterEn(entrada, pos);
        
        if (!this.esDigito(primerCaracter)) {
            return this.crearResultadoFallido();
        }

        // Estado 1: Reconociendo parte entera
        estado = 1;
        lexema += primerCaracter;
        pos++;

        // Continuar con dígitos de la parte entera
        while (!this.esFinDeEntrada(entrada, pos)) {
            const caracterActual = this.caracterEn(entrada, pos);
            
            if (this.esDigito(caracterActual)) {
                lexema += caracterActual;
                pos++;
            } else if (caracterActual === '.') {
                estado = 2; // Encontramos el punto decimal
                break;
            } else {
                return this.crearResultadoFallido();
            }
        }

        // Estado 2: Verificar punto decimal
        if (estado !== 2) {
            return this.crearResultadoFallido();
        }

        lexema += '.';
        pos++;

        // Estado 3: Debe haber al menos un dígito después del punto
        if (this.esFinDeEntrada(entrada, pos)) {
            return this.crearResultadoFallido();
        }

        const primerCaracterDecimal = this.caracterEn(entrada, pos);
        
        if (!this.esDigito(primerCaracterDecimal)) {
            return this.crearResultadoFallido();
        }

        estado = 3; // Estado de aceptación
        lexema += primerCaracterDecimal;
        pos++;

        // Continuar con más dígitos decimales
        while (!this.esFinDeEntrada(entrada, pos)) {
            const caracterActual = this.caracterEn(entrada, pos);
            
            if (this.esDigito(caracterActual)) {
                lexema += caracterActual;
                pos++;
            } else {
                break;
            }
        }

        return this.crearResultadoExitoso(lexema, lexema.length);
    }
}