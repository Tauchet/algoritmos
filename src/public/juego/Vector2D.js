/*

Presentado por:
- Henry Guillen Ramirez
- Luis Alfredo Gonzalez Jimenez
- Juan Esteban Chacon
- Cristian Camilo Guevara López

*/

// Clase para un manejo más rápido de las posiciones de un jugador en el juego
export default class Vector2D {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    getX() {
        return this.x;
    }

    setX(x) {
        this.x = x;
    }

    getY() {
        return this.y;
    }

    setY(y) {
        this.y = y;
    }

    clonar() {
        return new Vector2D(this.x, this.y);
    }

    incrementar(x, y) {
        return new Vector2D(this.x + x, this.y + y);
    }

}