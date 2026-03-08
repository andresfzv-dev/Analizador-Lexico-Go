import { Automata } from './Automata.js';

export class AutomataDelimitador extends Automata {
    constructor() {
        super('DELIMITADOR');
        this.delimitadores = {
            parentesis: {
                apertura: '(',
                cierre: ')'
            },
            llaves: {
                apertura: '{',
                cierre: '}'
            },
            corchetes: {
                apertura: '[',
                cierre: ']'
            },
            terminal: ';',
            separador: ',',
            punto: '.'
        };

        this.delimitadoresValidos = new Set(['(', ')', '{', '}', ';', ',', '[', ']', '.']);
    }

    obtenerCategoriaDelimitador(delimitador) {
        switch (delimitador) {
            case '(':
                return 'PARENTESIS_APERTURA';
            case ')':
                return 'PARENTESIS_CIERRE';
            case '{':
                return 'LLAVE_APERTURA';
            case '}':
                return 'LLAVE_CIERRE';
            case '[':
                return 'CORCHETE_APERTURA';
            case ']':
                return 'CORCHETE_CIERRE';
            case ';':
                return 'TERMINAL';
            case ',':
                return 'SEPARADOR';
            case '.':
            return 'OPERADOR DE ACCESO';
            default:
                return 'DELIMITADOR';
        }
    }

    esDelimitador(caracter) {
        return this.delimitadoresValidos.has(caracter);
    }

    reconocer(entrada, posicionInicial) {
        if (this.esFinDeEntrada(entrada, posicionInicial)) {
            return this.crearResultadoFallido();
        }

        const caracter = this.caracterEn(entrada, posicionInicial);
        
        if (!this.esDelimitador(caracter)) {
            return this.crearResultadoFallido();
        }

        const categoria = this.obtenerCategoriaDelimitador(caracter);

        return {
            exito: true,
            lexema: caracter,
            longitud: 1,
            categoria: categoria
        };
    }
}