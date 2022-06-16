/*

Presentado por:
- Henry Guillen Ramirez
- Luis Alfredo Gonzalez Jimenez
- Juan Esteban Chacon
- Cristian Camilo Guevara López

*/

import Direcciones from "./Direccion.js";
import Vector2D from "./Vector2D.js";

// Traer solo la dirección hacía abajo, para que el jugador se muestre siempre viendo hacía abajo
// cuando inicia un mapa
const [DireccionAbajo] = Direcciones;

// Clase para la creación de mapas, de manera rápida y eficiente
class Mapa {
  constructor(direccionInicial, ubicacionInicial, matrix) {
    this.direccionInicial = direccionInicial;
    this.ubicacionInicial = ubicacionInicial;
    this.matrix = matrix;
  }

  getDireccionInicial() {
    return this.direccionInicial;
  }

  getUbicacionInicial() {
    return this.ubicacionInicial;
  }

  getMatrix() {
    return this.matrix;
  }
}

// Exportamos la lista de los mapas
export default [

  // Mapa 1 (Direccion, PosiciónInicial, Matriz de Juego)
  new Mapa(DireccionAbajo, new Vector2D(1, 5), [
    ["X", "X", "X", "X", "X", "X", "X"],
    ["X", " ", " ", " ", " ", " ", "X"],
    ["X", " ", "X", "X", "X", " ", "X"],
    ["X", " ", " ", "H", "X", " ", "X"],
    ["X", "X", "X", "X", "X", " ", "X"],
    ["X", " ", " ", " ", " ", " ", "X"],
    ["X", "X", "X", "X", "X", "X", "X"],
  ]),

  // Mapa 2 (Direccion, PosiciónInicial, Matriz de Juego)
  new Mapa(DireccionAbajo, new Vector2D(1, 6), [
    ["X", "X", "X", "X", "X", "X", "X", "X"],
    ["X", "X", "X", "X", " ", " ", "H", "X"],
    ["X", "X", "X", "X", " ", "X", "X", "X"],
    ["X", "X", "X", "X", " ", "X", "X", "X"],
    ["X", "X", "X", "X", " ", "X", "X", "X"],
    ["X", "X", "X", "X", " ", "X", "X", "X"],
    ["X", " ", " ", " ", " ", "X", "X", "X"],
    ["X", "X", "X", "X", "X", "X", "X", "X"],
  ]),

  // Mapa 3 (Direccion, PosiciónInicial, Matriz de Juego)
  new Mapa(DireccionAbajo, new Vector2D(1, 5), [
    ["X", "X", "X", "X", "X", "X", "X", "X"],
    ["X", " ", " ", " ", "X", " ", "H", "X"],
    ["X", " ", "X", " ", "X", " ", "X", "X"],
    ["X", " ", "X", " ", " ", " ", " ", "X"],
    ["X", " ", "X", " ", " ", " ", " ", "X"],
    ["X", " ", "X", "X", "X", " ", " ", "X"],
    ["X", " ", " ", " ", "X", " ", " ", "X"],
    ["X", "X", "X", "X", "X", "X", "X", "X"],
  ]),

  // Mapa 4 (Direccion, PosiciónInicial, Matriz de Juego)
  new Mapa(DireccionAbajo, new Vector2D(1, 6), [
    ["X", "X", "X", "X", "X", "X", "X", "X"],
    ["X", "X", "X", "X", " ", " ", " ", "X"],
    ["X", " ", " ", " ", " ", "X", "H", "X"],
    ["X", " ", "X", "X", "X", "X", "X", "X"],
    ["X", " ", " ", " ", " ", "X", " ", "X"],
    ["X", "X", "X", "X", " ", "X", " ", "X"],
    ["X", " ", " ", " ", " ", " ", " ", "X"],
    ["X", "X", "X", "X", "X", "X", "X", "X"],
  ]),

  // Mapa 5 (Direccion, PosiciónInicial, Matriz de Juego)
  new Mapa(DireccionAbajo, new Vector2D(2, 4), [
    ["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"],
    ["X", "X", "X", "X", "X", "X", "H", " ", " ", "X"],
    ["X", "X", " ", "X", "X", " ", "X", "X", " ", "X"],
    ["X", "X", " ", " ", " ", " ", " ", " ", " ", "X"],
    ["X", " ", " ", "X", " ", " ", "X", "X", "X", "X"],
    ["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"],
  ])
];

