import { Automata } from './Automata.js';

/**
 * Autómata para reconocer números enteros.
 * Expresión regular: [0-9]+
 * 
 * Estados:
 * - q0 (inicial): Esperando primer dígito
 * - q1 (aceptación): Reconociendo dígitos
 * 
 * @class AutomataEntero
 * @extends Automata
 */
export class AutomataEntero extends Automata {
    constructor() {
        super('ENTERO');
    }

    /**
     * Reconoce números enteros en la entrada
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

        // Estado 1: Reconociendo dígitos
        estado = 1;
        lexema += primerCaracter;
        pos++;

        // Continuar mientras haya dígitos
        while (!this.esFinDeEntrada(entrada, pos)) {
            const caracterActual = this.caracterEn(entrada, pos);
            
            if (this.esDigito(caracterActual)) {
                lexema += caracterActual;
                pos++;
            } else {
                // Si encontramos un punto, no es entero (podría ser decimal)
                if (caracterActual === '.') {
                    // Verificamos si hay un dígito después del punto
                    const siguienteCaracter = this.caracterEn(entrada, pos + 1);
                    if (siguienteCaracter && this.esDigito(siguienteCaracter)) {
                        // Es un decimal, no un entero
                        return this.crearResultadoFallido();
                    }
                }
                break;
            }
        }

        return this.crearResultadoExitoso(lexema, lexema.length);
    }
}