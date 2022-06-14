export default class Jugador {
  constructor() {
    this.info = null;
    this.pregunta = null;
    this.pasos = null;
    this.niveles = [];
    this.nuevo = true;
  }

  getInfo() {
    return this.info;
  }

  setInfo(info) {
    this.info = info;
    localStorage.setItem("jugador", JSON.stringify(info));
  }

  getPregunta() {
    return this.pregunta;
  }

  setPregunta(pregunta) {
    this.pregunta = pregunta;
    localStorage.setItem("pregunta", pregunta);
  }

  getPasos() {
    return this.pasos;
  }

  setPasos(pasos) {
    this.pasos = pasos;
    localStorage.setItem("pasos", JSON.stringify(pasos));
  }

  getNiveles() {
    return this.niveles;
  }

  isNuevo() {
    return this.nuevo;
  }

  async cargar() {
    if (
      localStorage.getItem("jugador") == null ||
      localStorage.getItem("pregunta") == null ||
      localStorage.getItem("pasos") == null
    ) {
      localStorage.clear();
      this.nuevo = true;
      return;
    } else {
      try {
        this.info = JSON.parse(localStorage.getItem("jugador"));
        this.pregunta = parseInt(localStorage.getItem("pregunta"));
        this.pasos = JSON.parse(localStorage.getItem("pasos"));
        const respuesta = await axios.get("/api/jugadores/" + this.info.id);
        this.niveles = respuesta.data.success;
        this.nuevo = false;
      } catch (e) {
        alert("¡Ha ocurrido un error!");
        window.location.reload();
      }
    }
  }
}
