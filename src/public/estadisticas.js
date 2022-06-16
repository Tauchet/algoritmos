/*

Presentado por:
- Henry Guillen Ramirez
- Luis Alfredo Gonzalez Jimenez
- Juan Esteban Chacon
- Cristian Camilo Guevara López

*/

// Función para cargar el top tabla de jugadores
async function cargarTablaJugadores() {

  // Encontramos el elemento en el documento
  const tablaJugadores = document.querySelector("#tabla-de-jugadores tbody");

  // Obtenemos la información desde el servidor
  const respuesta = await axios.get("/api/estadisticas/top");
  const top = respuesta.data;

  // Recorremos todos los resultados encontrados desde el servidor
  var posicion = 1;
  for (var jugador of top) {

    // Agregamos como elemento html, dentro de la tabla indicada
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

// Función para cargar la información sobre las preguntas
async function cargarTablaPreguntas() {

  // Encontramos el elemento en el documento
  const tablaPreguntas = document.querySelector("#tabla-de-preguntas tbody");

  // Obtenemos la información desde el servidor
  const respuesta = await axios.get("/api/estadisticas/general");
  const preguntas = respuesta.data;

  // Recorremos todos los resultados encontrados desde el servidor
  for (var pregunta of preguntas) {

    // Calculamos la cantidad total de las preguntas
    const preguntaTotal = pregunta.correctos + pregunta.incorrectos;

    // Calculamos los porcentajes de cada uno
    const preguntasCorrectasPorcent = Math.round((pregunta.correctos / preguntaTotal) * 100);
    const preguntasIncorrectasPorcent = Math.round((pregunta.incorrectos / preguntaTotal) * 100);

    // Agregamos como elemento html, dentro de la tabla indicada
    tablaPreguntas.innerHTML += `
        <tr>
            <td>${pregunta.numero}</td>
            <td>${pregunta.correctos} (${preguntasCorrectasPorcent}%)</td>
            <td>${pregunta.incorrectos} (${preguntasIncorrectasPorcent}%)</td>
        </tr>
    `;
  }
}

// Función para cargar la información sobre las preguntas
async function cargarTablaSatisfaccion() {

  // Encontramos el elemento en el documento
  const tablaPreguntas = document.querySelector("#tabla-de-satisfaccion tbody");

  // Obtenemos la información desde el servidor
  const respuesta = await axios.get("/api/estadisticas/preguntas");
  const preguntas = respuesta.data;

  // Recorremos todos los resultados encontrados desde el servidor
  for (var pregunta of preguntas) {

     // Mediante el número de la pregunta obtenemos el titulo de esta
    var preguntaTitulo = "¿QUÉ TAN COMPLEJOS LE PARECIERON LOS MAPAS?";
    if (pregunta.numero == 2) {
      preguntaTitulo = "¿QUÉ TANTO SE DIVIRTIÓ COMPLENTANDO LOS MAPAS?";
    } else if (pregunta.numero == 3) {
      preguntaTitulo = "¿QUÉ TAN INTUITIVO LE PARECIÓ LA FUNCIONALIDAD DEL JUEGO?";
    }

    // Agregamos como elemento html, dentro de la tabla indicada
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

// Función para cargar el coeficiente de correlación en base a los selectores
async function cargarCoeficiente() {

  // Obtenemos el elemento donde se mostrará el resultado de la búsqueda
  const $cantidad = document.querySelector(".correlacion-cant");

  // Seleccionamos los elementos de selección del nivle y pregunta del HTML
  const $selectorNivel = document.querySelector("#selector-nivel");
  const $selectorPregunta = document.querySelector("#selector-pregunta");

  // Obtenemos la información desde el servidor, basandonos en la selección del nivel y la pregunta
  const respuesta = await axios.get("/api/estadisticas/coeficiente/" + $selectorNivel.value + "/" + $selectorPregunta.value);
  
  // Validamos que no haya ocurrido algún error al cálcular este dato
  if (respuesta.data.error) {
    $cantidad.innerText = "¡No hay datos suficientes!";
  } else {
    $cantidad.innerText = "Coeficiente: " + respuesta.data.resultado;
  }

}

// Función que se ejecuta por primera vez, cada vez que la página se recarga.
async function main() {
  await cargarTablaJugadores();
  await cargarTablaPreguntas();
  await cargarTablaSatisfaccion();
  await cargarCoeficiente();

  // Seleccionamos todos los elementos que sean de tipo selector
  const $selects = document.querySelectorAll("select");
  
  // Recorremos los elementos anteriormente encontrados
  for (var $select of $selects) {
    
    // Creamos un evento, para que cada vez que alguno cambie, ejecute la función de cargar el coeficiente.
    $select.addEventListener("change", function() {

      cargarCoeficiente();
      
    })
  }

}

main();
