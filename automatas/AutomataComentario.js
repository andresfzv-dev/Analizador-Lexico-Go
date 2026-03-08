import { Automata } from './Automata.js';
 
export class AutomataComentario extends Automata {
    constructor() {
        super('COMENTARIO');
    }

    /**
     * Reconoce comentarios en la entrada
     * @param {string} entrada - Cadena de entrada
     * @param {number} posicionInicial - Posición inicial
     * @returns {{exito: boolean, lexema: string, longitud: number, categoria?: string, error?: string}}
     */
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

        // Comentario de línea //
        if (segundoCaracter === '/') {
            return this.reconocerComentarioLinea(entrada, posicionInicial);
        }
        // Comentario de bloque /*
        else if (segundoCaracter === '*') {
            return this.reconocerComentarioBloque(entrada, posicionInicial);
        }

        return this.crearResultadoFallido();
    }

    /**
     * Reconoce comentarios de línea
     * @private
     * @param {string} entrada - Cadena de entrada
     * @param {number} posicionInicial - Posición inicial
     * @returns {{exito: boolean, lexema: string, longitud: number, categoria: string}}
     */
    reconocerComentarioLinea(entrada, posicionInicial) {
        let pos = posicionInicial;
        let lexema = '//';
        pos += 2;

        // Leer hasta el final de la línea o final del archivo
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

    /**
     * Reconoce comentarios de bloque
     * @private
     * @param {string} entrada - Cadena de entrada
     * @param {number} posicionInicial - Posición inicial
     * @returns {{exito: boolean, lexema: string, longitud: number, categoria: string, error?: string}}
     */
    reconocerComentarioBloque(entrada, posicionInicial) {
        let pos = posicionInicial;
        let lexema = '/*';
        pos += 2;
        let estado = 1; // Estado dentro del comentario

        // Buscar el cierre del comentario */
        while (!this.esFinDeEntrada(entrada, pos)) {
            const caracterActual = this.caracterEn(entrada, pos);
            
            if (estado === 1) {
                // Dentro del comentario
                if (caracterActual === '*') {
                    estado = 2; // Posible inicio del cierre
                    lexema += caracterActual;
                    pos++;
                } else {
                    lexema += caracterActual;
                    pos++;
                }
            } else if (estado === 2) {
                // Después de *, verificar si viene /
                if (caracterActual === '/') {
                    lexema += caracterActual;
                    pos++;
                    // Comentario cerrado correctamente
                    return {
                        exito: true,
                        lexema: lexema,
                        longitud: lexema.length,
                        categoria: 'COMENTARIO_BLOQUE'
                    };
                } else if (caracterActual === '*') {
                    // Otro *, seguir en estado 2
                    lexema += caracterActual;
                    pos++;
                } else {
                    // No es cierre, volver a estado 1
                    estado = 1;
                    lexema += caracterActual;
                    pos++;
                }
            }
        }

        // Si llegamos aquí, el comentario no se cerró
        return {
            exito: true,
            lexema: lexema,
            longitud: lexema.length,
            categoria: 'ERROR',
            error: 'Comentario de bloque sin cerrar (falta */)'
        };
    }
}