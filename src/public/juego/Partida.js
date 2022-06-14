export default class Partida {

    constructor() {
        this.posicionPixel = null;
        this.posicionMatrix = null;
        this.ultimaPosicionMatrix = null;
        this.animacionPosicionFinal = null;
        this.jugadorMovimientos = null;
        this.jugadorSgteMovimiento = 0;
        this.jugadorAnimando = false;
        this.actualMatrix = [];
        this.actualDireccion = null;
        this.actualMapa = null;
        this.actualMapaIndex = 0;
    }

    getAnimacionPosicionFinal() {
        return this.animacionPosicionFinal;
    }

    setAnimacionPosicionFinal(animacionPosicionFinal) {
        this.animacionPosicionFinal = animacionPosicionFinal;
    }

    getUltimaPosicionMatrix() {
        return this.ultimaPosicionMatrix;
    }

    setUltimaPosicionMatrix(ultimaPosicionMatrix) {
        this.ultimaPosicionMatrix = ultimaPosicionMatrix;
    }


    getPosicionPixel() {
        return this.posicionPixel;
    }

    setPosicionPixel(posicionPixel) {
        this.posicionPixel = posicionPixel;
    }

    getPosicionMatrix() {
        return this.posicionMatrix;
    }

    setPosicionMatrix(posicionMatrix) {
        this.posicionMatrix = posicionMatrix;
    }

    isJugadorAnimando() {
        return this.jugadorAnimando;
    }

    setJugadorAnimando(jugadorAnimando) {
        this.jugadorAnimando = jugadorAnimando;
    }

    getJugadorMovimientos() {
        return this.jugadorMovimientos;
    }

    getJugadorSgteMovimiento() {
        return this.jugadorSgteMovimiento;
    }

    incJugadorSgteMovimiento() {
        this.jugadorSgteMovimiento++;
    }

    reiniciarJugadorMovimientos(movimientos) {
        this.jugadorMovimientos = movimientos;
        this.jugadorSgteMovimiento = 0;
    }

    getActualMatrix() {
        return this.actualMatrix;
    }

    setActualMatrix(matrix) {
        this.actualMatrix = matrix;
        return this.actualMatrix;
    }

    getActualDireccion() {
        return this.actualDireccion;
    }

    setActualDireccion(direccion) {
        this.actualDireccion = direccion;
    }

    getActualMapa() {
        return this.actualMapa;
    }

    setActualMapa(mapa) {
        this.actualMapa = mapa;
    }

    getActualMapaIndex() {
        return this.actualMapaIndex;
    }

    setActualMapaIndex(actualMapaIndex) {
        this.actualMapaIndex = actualMapaIndex;
    }

}