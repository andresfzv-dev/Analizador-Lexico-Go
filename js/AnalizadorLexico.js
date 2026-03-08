import { AutomataEntero } from '../automatas/AutomataEntero.js';
import { AutomataDecimal } from '../automatas/AutomataDecimal.js';
import { AutomataIdentificador } from '../automatas/AutomataIdentificador.js';
import { AutomataOperador } from '../automatas/AutomataOperador.js';
import { AutomataDelimitador } from '../automatas/AutomataDelimitador.js';
import { AutomataCadena } from '../automatas/AutomataCadena.js';
import { AutomataComentario } from '../automatas/AutomataComentario.js';

export class AnalizadorLexico {
    constructor() {
        this.automatas = [
            new AutomataComentario(),   
            new AutomataCadena(),          
            new AutomataDecimal(),         
            new AutomataEntero(),          
            new AutomataIdentificador(),   
            new AutomataOperador(),        
            new AutomataDelimitador()      
        ];
    }

    esEspacioEnBlanco(caracter) {
        return /\s/.test(caracter);
    }

    saltarEspaciosEnBlanco(entrada, pos) {
        while (pos < entrada.length && this.esEspacioEnBlanco(entrada[pos])) {
            pos++;
        }
        return pos;
    }

    obtenerLineaYColumna(entrada, pos) {
        let linea = 1;
        let columna = 1;

        for (let i = 0; i < pos && i < entrada.length; i++) {
            if (entrada[i] === '\n') {
                linea++;
                columna = 1;
            } else {
                columna++;
            }
        }

        return { linea, columna };
    }

    analizar(codigoFuente) {
        const tokens = [];
        const errores = [];
        let pos = 0;
        let idToken = 1;

        while (pos < codigoFuente.length) {
            pos = this.saltarEspaciosEnBlanco(codigoFuente, pos);

            if (pos >= codigoFuente.length) {
                break;
            }

            const posicion = this.obtenerLineaYColumna(codigoFuente, pos);
            
            let tokenReconocido = false;

            for (const automata of this.automatas) {
                const resultado = automata.reconocer(codigoFuente, pos);

                if (resultado.exito) {
                    const token = {
                        id: idToken++,
                        lexema: resultado.lexema,
                        categoria: resultado.categoria || automata.categoria,
                        linea: posicion.linea,
                        columna: posicion.columna
                    };
                    if (resultado.error) {
                        errores.push({
                            mensaje: resultado.error,
                            lexema: resultado.lexema,
                            linea: posicion.linea,
                            columna: posicion.columna
                        });
                        token.tieneError = true;
                    }

                    tokens.push(token);
                    pos += resultado.longitud;
                    tokenReconocido = true;
                    break;
                }
            }

            if (!tokenReconocido) {
                const caracterNoReconocido = codigoFuente[pos];
                const codigoCaracter = caracterNoReconocido.charCodeAt(0);
                
                errores.push({
                    mensaje: `Token no reconocido: '${caracterNoReconocido}' (código: ${codigoCaracter})`,
                    lexema: caracterNoReconocido,
                    linea: posicion.linea,
                    columna: posicion.columna
                });

                tokens.push({
                    id: idToken++,
                    lexema: caracterNoReconocido,
                    categoria: 'ERROR',
                    linea: posicion.linea,
                    columna: posicion.columna,
                    tieneError: true
                });

                pos++;
            }
        }

        const estadisticas = this.calcularEstadisticas(tokens, errores);

        return {
            tokens,
            errores,
            estadisticas
        };
    }

    calcularEstadisticas(tokens, errores) {
        const categorias = new Set();
        tokens.forEach(token => {
            if (token.categoria !== 'ERROR') {
                categorias.add(token.categoria);
            }
        });
        return {
            totalTokens: tokens.length,
            totalErrores: errores.length,
            totalCategorias: categorias.size,
            categoriasEncontradas: Array.from(categorias).sort()
        };
    }

    formatearResultados(resultadoAnalisis) {
        return resultadoAnalisis.tokens.map(token => ({
            ...token,
            categoriaVisualizacion: this.formatearCategoria(token.categoria)
        }));
    }

    formatearCategoria(categoria) {
        return categoria
            .split('_')
            .map(palabra => palabra.charAt(0) + palabra.slice(1).toLowerCase())
            .join(' ');
    }
}