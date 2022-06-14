export default class Partida {

    constructor() {
        this.posicionMatrix = null;
        this.jugadorMovimientos = null;
        this.jugadorSgteMovimiento = 0;
        this.jugadorAnimando = false;
        this.actualMatrix = [];
        this.actualDireccion = null;
        this.actualMapa = null;
        this.actualMapaIndex = 0;
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

    setJugadorSgteMovimiento(jugadorSgteMovimiento) {
        this.jugadorSgteMovimiento = jugadorSgteMovimiento;
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