/*

Presentado por:
- Henry Guillen Ramirez
- Luis Alfredo Gonzalez Jimenez
- Juan Esteban Chacon
- Cristian Camilo Guevara López

*/


// Clase para el control del estado del jugador,
// en base a su información
export default class Jugador {
  constructor() {
    this.info = null;
    this.pregunta = null;
    this.pasos = null;
    this.niveles = [];
    this.nuevo = true;
  }

  // Retorna información básica del jugador
  getInfo() {
    return this.info;
  }

  // Actualiza y guarda la información básica del jugador
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

  // Función para cargar los datos que se encuentra en la aplicación.
  async cargar() {

    // Validamos si algún dato falta
    if (
      localStorage.getItem("jugador") == null ||
      localStorage.getItem("pregunta") == null ||
      localStorage.getItem("pasos") == null
    ) {

      // Entonces eliminamos el almacenamiento de la aplicación y tomamos como si fuera un nuevo jugador
      localStorage.clear();
      this.nuevo = true;

      return;
    } else {
      try {
        
        // Cargamos todos los datos locales
        this.info = JSON.parse(localStorage.getItem("jugador"));
        this.pregunta = parseInt(localStorage.getItem("pregunta"));
        this.pasos = JSON.parse(localStorage.getItem("pasos"));

        // Cargamos la información que se encuentra en el servidor,
        // este nos trae que niveles se han realizado y además sus respectivos
        // pasos
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
