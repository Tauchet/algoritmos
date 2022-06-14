import Direcciones from "./Direccion.js";
import Vector2D from "./Vector2D.js";

const [DireccionAbajo] = Direcciones;

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

export default [

  new Mapa(DireccionAbajo, new Vector2D(1, 5), [
    ["X", "X", "X", "X", "X", "X", "X"],
    ["X", " ", " ", " ", " ", " ", "X"],
    ["X", " ", "X", "X", "X", " ", "X"],
    ["X", " ", " ", "H", "X", " ", "X"],
    ["X", "X", "X", "X", "X", " ", "X"],
    ["X", " ", " ", " ", " ", " ", "X"],
    ["X", "X", "X", "X", "X", "X", "X"],
  ]),

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

  new Mapa(DireccionAbajo, new Vector2D(2, 4), [
    ["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"],
    ["X", "X", "X", "X", "X", "X", "H", " ", " ", "X"],
    ["X", "X", " ", "X", "X", " ", "X", "X", " ", "X"],
    ["X", "X", " ", " ", " ", " ", " ", " ", " ", "X"],
    ["X", " ", " ", "X", " ", " ", "X", "X", "X", "X"],
    ["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"],
  ])
];

