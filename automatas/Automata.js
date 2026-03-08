export class Automata {

    constructor(){
        if (this.constructor === Automata) {
            throw new Error("No se puede instanciar una clase abstracata");
        }
        this.categoria = categoria;
    }

    reconocer(entrada, posicionInicial){
        throw new Error("El método reconocer() debe ser implementado");
    }

    esEspacioEnBlanco(caracter){
        return /\s/.test(caracter);
    }

    esDigito(caracter){
        return /[0-9]/.test(caracter);
    }

    esLetra(caracter){
        return /[a-zA-Z]/.test(caracter);
    }

    esAlfanumerico(caracter){
        return /[a-zA-Z0-9]/.test(caracter);
    }

    esFinDeEntrada(entrada, pos){
        return pos >= entrada.length;
    }

    caracterEn(entrada, pos){
        return pos < entrada.length ? entrada[pos] : null;
    }

    crearResultadoExitoso(lexema, longitud) {
        return {
            exito: true,
            lexema,
            longitud
        };
    }

    crearResultadoFallido(error = null) {
        const resultado = { exito: false };
        if (error) {
            resultado.error = error;
        }
        return resultado;
    }

}