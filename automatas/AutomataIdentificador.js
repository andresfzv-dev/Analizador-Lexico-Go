import { Automata } from './Automata.js';

export class AutomataIdentificador extends Automata {
    constructor() {
        super('IDENTIFICADOR');
        this.palabrasReservadas = new Set([
            'break','default','func','interface','select',
            'case','defer','go','map','struct',
            'chan','else','goto','package','switch',
            'const','fallthrough','if','range','type',
            'continue','for','import','return','var'
        ]);

        
        this.longitudMaxima = 15;
    }

    esCaracterInicioValido(caracter) {
        return this.esLetra(caracter) || caracter === '_';
    }

    esCaracterIdentificadorValido(caracter) {
        return this.esAlfanumerico(caracter) || caracter === '_';
    }

    esPalabraReservada(palabra) {
        return this.palabrasReservadas.has(palabra.toLowerCase());
    }

    reconocer(entrada, posicionInicial) {
        let pos = posicionInicial;
        let lexema = '';

        if (this.esFinDeEntrada(entrada, pos)) {
            return this.crearResultadoFallido();
        }

        const primerCaracter = this.caracterEn(entrada, pos);
        
        if (!this.esCaracterInicioValido(primerCaracter)) {
            return this.crearResultadoFallido();
        }
        lexema += primerCaracter;
        pos++;
        while (!this.esFinDeEntrada(entrada, pos)) {
            const caracterActual = this.caracterEn(entrada, pos);
            
            if (this.esCaracterIdentificadorValido(caracterActual)) {
                lexema += caracterActual;
                pos++;
            } else {
                break;
            }
        }

        if (lexema.length > this.longitudMaxima) {
            return {
                exito: true,
                lexema: lexema,
                longitud: lexema.length,
                categoria: 'ERROR',
                error: `Identificador excede el límite de ${this.longitudMaxima} caracteres (longitud: ${lexema.length})`
            };
        }
        const categoria = this.esPalabraReservada(lexema) ? 'PALABRA_RESERVADA' : 'IDENTIFICADOR';

        return {
            exito: true,
            lexema: lexema,
            longitud: lexema.length,
            categoria: categoria
        };
    }
}