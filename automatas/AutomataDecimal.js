import { Automata } from './Automata.js';

export class AutomataDecimal extends Automata {
    constructor() {
        super('DECIMAL');
    }

    reconocer(entrada, posicionInicial) {
        let pos = posicionInicial;
        let estado = 0;
        let lexema = '';

        if (this.esFinDeEntrada(entrada, pos)) {
            return this.crearResultadoFallido();
        }

        const primerCaracter = this.caracterEn(entrada, pos);
        
        if (!this.esDigito(primerCaracter)) {
            return this.crearResultadoFallido();
        }

        estado = 1;
        lexema += primerCaracter;
        pos++;

        while (!this.esFinDeEntrada(entrada, pos)) {
            const caracterActual = this.caracterEn(entrada, pos);
            
            if (this.esDigito(caracterActual)) {
                lexema += caracterActual;
                pos++;
            } else if (caracterActual === '.') {
                estado = 2;
                break;
            } else {
                return this.crearResultadoFallido();
            }
        }

        if (estado !== 2) {
            return this.crearResultadoFallido();
        }

        lexema += '.';
        pos++;

        if (this.esFinDeEntrada(entrada, pos)) {
            return this.crearResultadoFallido();
        }

        const primerCaracterDecimal = this.caracterEn(entrada, pos);
        
        if (!this.esDigito(primerCaracterDecimal)) {
            return this.crearResultadoFallido();
        }

        estado = 3;
        lexema += primerCaracterDecimal;
        pos++;

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