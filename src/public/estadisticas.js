async function cargarTablaJugadores() {
  const tablaJugadores = document.querySelector("#tabla-de-jugadores tbody");
  const respuesta = await axios.get("/api/estadisticas/top");
  const top = respuesta.data;
  var posicion = 1;
  for (var jugador of top) {
    tablaJugadores.innerHTML += `
        <tr>
            <td>${posicion}</td>
            <td>${jugador.nombre}</td>
            <td>${jugador.correctas} / ${
      jugador.correctas + jugador.incorrectas
    }</td>
        </tr>
    `;
    posicion++;
  }
}

async function cargarTablaPreguntas() {
  const tablaPreguntas = document.querySelector("#tabla-de-preguntas tbody");
  const respuesta = await axios.get("/api/estadisticas/general");
  const preguntas = respuesta.data;
  for (var pregunta of preguntas) {
    const preguntaTotal = pregunta.correctos + pregunta.incorrectos;
    tablaPreguntas.innerHTML += `
        <tr>
            <td>${pregunta.numero}</td>
            <td>${pregunta.correctos} (${Math.round(
      (pregunta.correctos / preguntaTotal) * 100
    )}%)</td>
    <td>${pregunta.incorrectos} (${Math.round(
      (pregunta.incorrectos / preguntaTotal) * 100
    )}%)</td>
        </tr>
    `;
  }
}

async function cargarTablaSatisfaccion() {
  const tablaPreguntas = document.querySelector("#tabla-de-satisfaccion tbody");
  const respuesta = await axios.get("/api/estadisticas/preguntas");
  const preguntas = respuesta.data;
  for (var pregunta of preguntas) {

    var preguntaTitulo = "¿QUÉ TAN COMPLEJOS LE PARECIERON LOS MAPAS?";
    if (pregunta.numero == 2) {
      preguntaTitulo = "¿QUÉ TANTO SE DIVIRTIÓ COMPLENTANDO LOS MAPAS?";
    } else if (pregunta.numero == 3) {
      preguntaTitulo = "¿QUÉ TAN INTUITIVO LE PARECIÓ LA FUNCIONALIDAD DEL JUEGO?";
    }

    tablaPreguntas.innerHTML += `
          <tr>
              <td class='pregunta'>${pregunta.numero} ${preguntaTitulo}</td>
              <td>${pregunta.promedio}</td>
              <td>${pregunta.menor}</td>
              <td>${pregunta.mayor}</td>
              <td>${pregunta.cantidad}</td>
          </tr>
      `;
  }
}

async function cargarCoeficiente() {
  const $cantidad = document.querySelector(".correlacion-cant");
  const $selectorNivel = document.querySelector("#selector-nivel");
  const $selectorPregunta = document.querySelector("#selector-pregunta");
  const respuesta = await axios.get("/api/estadisticas/coeficiente/" + $selectorNivel.value + "/" + $selectorPregunta.value);
  if (respuesta.data.error) {
    $cantidad.innerText = "¡No hay datos suficientes!";
  } else {
    $cantidad.innerText = "Coeficiente: " + respuesta.data.resultado;
  }
}

async function main() {
  await cargarTablaJugadores();
  await cargarTablaPreguntas();
  await cargarTablaSatisfaccion();
  await cargarCoeficiente();

  const $selects = document.querySelectorAll("select");
  for (var $select of $selects) {
    $select.addEventListener("change", function() {
      cargarCoeficiente();
    })
  }

}

main();
