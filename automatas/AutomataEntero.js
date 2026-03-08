import { Automata } from './Automata.js';

export class AutomataEntero extends Automata {
    constructor() {
        super('ENTERO');
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
            } else {
                if (caracterActual === '.') {
                    const siguienteCaracter = this.caracterEn(entrada, pos + 1);
                    if (siguienteCaracter && this.esDigito(siguienteCaracter)) {
                        return this.crearResultadoFallido();
                    }
                }
                break;
            }
        }

        return this.crearResultadoExitoso(lexema, lexema.length);
    }
}