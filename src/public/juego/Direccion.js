/*

Presentado por:
- Henry Guillen Ramirez
- Luis Alfredo Gonzalez Jimenez
- Juan Esteban Chacon
- Cristian Camilo Guevara López

*/

class Direccion {

    constructor(i, sumarX, sumarY) {
        this.i = i;
        this.sumarX = sumarX;
        this.sumarY = sumarY;
    }

    // Posición y indice al que se encuentra la imagen y la dirección en el arreglo
    getI() {
        return this.i;
    }

    // Al utilizarse está función cuál es el valor que debe sumarse en X para seguir en esa dirección
    getSumarX() {
        return this.sumarX;
    }

    // Al utilizarse está función cuál es el valor que debe sumarse en Y para seguir en esa dirección
    getSumarY() {
        return this.sumarY;
    }

}

// Exportamos la lista de direcciones
export default [
    new Direccion(0, 0, 1), // Abajo (sX: 0, sY: 1)
    new Direccion(1, 0, -1), // Arriba (sX: 0, sY: -1)
    new Direccion(2, -1, 0), // Izquierda (sX: -1, sY: 0)
    new Direccion(3, 1, 0) // Derecha (sX: 1, sY: 0)
];