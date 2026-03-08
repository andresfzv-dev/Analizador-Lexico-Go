import { Automata } from "./Automata.js";

export class AutomataCadena extends Automata {
    constructor() {
        super('CADENA');
    }

    esEscapeValido(caracter) {
        return ['n', 't', 'r', 'a', 'b', 'f', 'v', '"', '\\', '\''].includes(caracter);
    }


        reconocer(entrada, posicionInicial) {
        let pos = posicionInicial;
        let estado = 0;
        let lexema = '';

        if (this.esFinDeEntrada(entrada, pos)) {
            return this.crearResultadoFallido();
        }

        const primerCaracter = this.caracterEn(entrada, pos);
        
        if (primerCaracter !== '"') {
            return this.crearResultadoFallido();
        }
        estado = 1;
        lexema += primerCaracter;
        pos++;
        while (!this.esFinDeEntrada(entrada, pos)) {
            const caracterActual = this.caracterEn(entrada, pos);
            if (estado === 1) {
                if (caracterActual === '"') {
                    lexema += caracterActual;
                    pos++;
                    estado = 3;
                    break;
                } else if (caracterActual === '\\') {
                    estado = 2;
                    lexema += caracterActual;
                    pos++;
                } else if (caracterActual === '\n' || caracterActual === '\r') {
                    return {
                        exito: true,
                        lexema: lexema,
                        longitud: lexema.length,
                        categoria: 'ERROR',
                        error: 'Cadena sin cerrar (salto de línea encontrado)'
                    };
                } else {
                    lexema += caracterActual;
                    pos++;
                }
            } else if (estado === 2) {
                lexema += caracterActual;
                pos++;
                estado = 1;
            }
        }
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