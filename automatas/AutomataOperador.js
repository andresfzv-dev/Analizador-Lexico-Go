import { Automata } from './Automata.js';

export class AutomataOperador extends Automata {
    constructor() {
        super('OPERADOR');
        
        this.operadoresSimples = {
            '+': 'OPERADOR_ARITMETICO',
            '-': 'OPERADOR_ARITMETICO',
            '*': 'OPERADOR_ARITMETICO',
            '/': 'OPERADOR_ARITMETICO',
            '%': 'OPERADOR_ARITMETICO',
            '=': 'OPERADOR_ASIGNACION',
            '<': 'OPERADOR_COMPARACION',
            '>': 'OPERADOR_COMPARACION',
            '!': 'OPERADOR_LOGICO'
        };
        
        this.operadoresCompuestos = {
            '==': 'OPERADOR_COMPARACION',
            '!=': 'OPERADOR_COMPARACION',
            '<=': 'OPERADOR_COMPARACION',
            '>=': 'OPERADOR_COMPARACION',
            '&&': 'OPERADOR_LOGICO',
            '||': 'OPERADOR_LOGICO',
            '++': 'OPERADOR_INC_DEC',
            '--': 'OPERADOR_INC_DEC',
            ':=': 'OPERADOR_ASIGNACION',
            '+=': 'OPERADOR_ASIGNACION',
            '-=': 'OPERADOR_ASIGNACION',
            '*=': 'OPERADOR_ASIGNACION',
            '/=': 'OPERADOR_ASIGNACION',
            '%=': 'OPERADOR_ASIGNACION'
        };
    }

    puedeIniciarOperador(caracter) {
        return caracter in this.operadoresSimples || caracter === ':' || caracter === '|' || caracter === '&';
    }

    obtenerCategoriaOperador(operador) {
        if (operador in this.operadoresCompuestos) {
            return this.operadoresCompuestos[operador];
        }
        if (operador in this.operadoresSimples) {
            return this.operadoresSimples[operador];
        }
        return null;
    }

    reconocer(entrada, posicionInicial) {
        let pos = posicionInicial;
        let lexema = '';
        if (this.esFinDeEntrada(entrada, pos)) {
            return this.crearResultadoFallido();
        }
        const primerCaracter = this.caracterEn(entrada, pos);
        if (!this.puedeIniciarOperador(primerCaracter)) {
            return this.crearResultadoFallido();
        }

        lexema += primerCaracter;
        pos++;

        if (!this.esFinDeEntrada(entrada, pos)) {
            const segundoCaracter = this.caracterEn(entrada, pos);
            const operadorCompuesto = lexema + segundoCaracter;
            const categoriaCompuesta = this.obtenerCategoriaOperador(operadorCompuesto);
            
            if (categoriaCompuesta) {
                return {
                    exito: true,
                    lexema: operadorCompuesto,
                    longitud: 2,
                    categoria: categoriaCompuesta
                };
            }
        }
        const categoriaSimple = this.obtenerCategoriaOperador(lexema);
        
        if (categoriaSimple) {
            return {
                exito: true,
                lexema: lexema,
                longitud: 1,
                categoria: categoriaSimple
            };
        }

        return this.crearResultadoFallido();
    }
}