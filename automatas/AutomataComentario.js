import { Automata } from './Automata.js';
 
export class AutomataComentario extends Automata {
    constructor() {
        super('COMENTARIO');
    }

    reconocer(entrada, posicionInicial) {
        let pos = posicionInicial;

        if (this.esFinDeEntrada(entrada, pos)) {
            return this.crearResultadoFallido();
        }

        const primerCaracter = this.caracterEn(entrada, pos);
        
        if (primerCaracter !== '/') {
            return this.crearResultadoFallido();
        }

        pos++;

        if (this.esFinDeEntrada(entrada, pos)) {
            return this.crearResultadoFallido();
        }

        const segundoCaracter = this.caracterEn(entrada, pos);

        if (segundoCaracter === '/') {
            return this.reconocerComentarioLinea(entrada, posicionInicial);
        }
        else if (segundoCaracter === '*') {
            return this.reconocerComentarioBloque(entrada, posicionInicial);
        }

        return this.crearResultadoFallido();
    }

    reconocerComentarioLinea(entrada, posicionInicial) {
        let pos = posicionInicial;
        let lexema = '//';
        pos += 2;

        while (!this.esFinDeEntrada(entrada, pos)) {
            const caracterActual = this.caracterEn(entrada, pos);
            
            if (caracterActual === '\n' || caracterActual === '\r') {
                break;
            }
            
            lexema += caracterActual;
            pos++;
        }

        return {
            exito: true,
            lexema: lexema,
            longitud: lexema.length,
            categoria: 'COMENTARIO_LINEA'
        };
    }

    reconocerComentarioBloque(entrada, posicionInicial) {
        let pos = posicionInicial;
        let lexema = '/*';
        pos += 2;
        let estado = 1;

        while (!this.esFinDeEntrada(entrada, pos)) {
            const caracterActual = this.caracterEn(entrada, pos);
            
            if (estado === 1) {
                if (caracterActual === '*') {
                    estado = 2;
                    lexema += caracterActual;
                    pos++;
                } else {
                    lexema += caracterActual;
                    pos++;
                }
            } else if (estado === 2) {
                if (caracterActual === '/') {
                    lexema += caracterActual;
                    pos++;
                    return {
                        exito: true,
                        lexema: lexema,
                        longitud: lexema.length,
                        categoria: 'COMENTARIO_BLOQUE'
                    };
                } else if (caracterActual === '*') {
                    lexema += caracterActual;
                    pos++;
                } else {
                    estado = 1;
                    lexema += caracterActual;
                    pos++;
                }
            }
        }
        return {
            exito: true,
            lexema: lexema,
            longitud: lexema.length,
            categoria: 'ERROR',
            error: 'Comentario de bloque sin cerrar (falta */)'
        };
    }
}