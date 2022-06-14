import Jugador from "./juego/Jugador.js";
import Direcciones from "./juego/Direccion.js";
import Mapas from "./juego/Mapa.js";
import Partida from "./juego/Partida.js";
import Vector2D from "./juego/Vector2D.js";

const imagenes = {};
const $canvas = $("canvas");
const render = $canvas.getContext("2d");

const jugador = new Jugador();
const partida = new Partida();

// Función para obtener el elemento del DOM en base a un selector
function $(selector) {
  return document.querySelector(selector);
}

// Función para obtener todos los elementos del DOM en base a un selector
function $$(selector) {
  return document.querySelectorAll(selector);
}

// Función para la creación de una imagen, para el pintado
// esta permite que si ya se ha cargado mantenga guardada
// para que su solicitud no sea constante y tardosa
function cargarImagen(url) {
  if (imagenes[url]) {
    return Promise.resolve(imagenes[url]);
  }
  return new Promise(function (resolve) {
    const imagen = new Image();
    imagen.onload = function () {
      imagenes[url] = imagen;
      resolve(imagen);
    };
    imagen.src = url;
  });
}

// Renderizar el mapa de la partida actual, en el lienzo que se muestra
async function renderizarMapa() {
  return await renderizarCanvas(
    render,
    partida.getActualMatrix(),
    partida.getPosicionMatrix().getX() * 16,
    partida.getPosicionMatrix().getY() * 16,
    partida.getActualDireccion().getI()
  );
}

// Renderizar encima de un lienzo, el mapa correspondiente pasado por parametro, además, la imagén del jugador
async function renderizarCanvas(render, actualMatrix, jugadorPosX, jugadorPosY, jugadorPosDireccion) {

  // Cargar las imagenes
  const bloqueLadrillo = await cargarImagen("/public/imagenes/bloque-ladrillo.png");
  const bloqueLadrilloFallo = await cargarImagen("/public/imagenes/bloque-ladrillo-fallo.png");
  const bloqueSuelo = await cargarImagen("/public/imagenes/bloque-suelo.png");
  const bloqueSueloArriba = await cargarImagen("/public/imagenes/bloque-suelo-arriba.png");
  const bloqueSueloDerecha = await cargarImagen("/public/imagenes/bloque-suelo-derecha.png");
  const bloqueSueloIzquierda = await cargarImagen("/public/imagenes/bloque-suelo-izquierda.png");
  const bloqueSueloAbajo = await cargarImagen("/public/imagenes/bloque-suelo-abajo.png");
  const personajeImagen = await cargarImagen("/public/imagenes/personaje.png");
  const bloqueSueloLlegada = await cargarImagen("/public/imagenes/bloque-suelo-meta.png");

  // Pintar mapa
  for (var y = 0; y < actualMatrix.length; y++) {
    for (var x = 0; x < actualMatrix[0].length; x++) {
      if (actualMatrix[y][x] === "X") {
        render.drawImage(bloqueLadrillo, x * 16, y * 16);
      } else if (actualMatrix[y][x] === "0") {
        render.drawImage(bloqueSueloAbajo, x * 16, y * 16);
      } else if (actualMatrix[y][x] === "1") {
        render.drawImage(bloqueSueloArriba, x * 16, y * 16);
      } else if (actualMatrix[y][x] === "2") {
        render.drawImage(bloqueSueloIzquierda, x * 16, y * 16);
      } else if (actualMatrix[y][x] === "3") {
        render.drawImage(bloqueSueloDerecha, x * 16, y * 16);
      } else if (actualMatrix[y][x] === "#") {
        render.drawImage(bloqueLadrilloFallo, x * 16, y * 16);
      } else if (actualMatrix[y][x] === "H") {
        render.drawImage(bloqueSueloLlegada, x * 16, y * 16);
      } else {
        render.drawImage(bloqueSuelo, x * 16, y * 16);
      }
    }
  }

  // Pintar personaje en una ubicación en pixel
  render.drawImage(personajeImagen, jugadorPosDireccion * 16, 0, 16, 16, jugadorPosX, jugadorPosY, 16, 16);
}

// Cambiar escenarios, ocultando el anterior y agregando el nuevo
function cambiarEscenario(nuevoEscenario) {
  const escenarioActivo = $(".escenario.activo");
  const anteriorEscenario = escenarioActivo ? escenarioActivo.getAttribute("data-escenario") : null;

  // El escenario ya se encuentra activo
  if (nuevoEscenario == anteriorEscenario) {
    return;
  }

  // Ocultar el anterior escenario
  if (escenarioActivo) {
    escenarioActivo.classList.remove("activo");
  }

  // Activar el nuevo escenario
  const siguienteEscenario = $("[data-escenario='" + nuevoEscenario + "']");
  siguienteEscenario.classList.add("activo");

  console.log("Nuevo Escenario: ", nuevoEscenario, anteriorEscenario);
}

// Está función sirve para que se inicie un mapa mostrando por primera vez el renderizado del mapa
async function mostrarEscenarioMapa(mapa) {
  cambiarEscenario("juego");

  // Cambiar toda la información para que inicie el proceso de la pregunta
  partida.setActualMatrix([...mapa.getMatrix()]);
  partida.setActualMapa(mapa);
  partida.setActualDireccion(mapa.getDireccionInicial());

  // Cambiar la ubicación a nivel de matrix:
  partida.setPosicionMatrix(mapa.getUbicacionInicial().clonar());

  recalcularTamanioMapa();
  renderizarMapa();
}

// Vamos a mostrar el mapa dimensionado dependiendo del dispositivo donde se encuentre
function recalcularTamanioMapa() {
  const nuevoMapa = partida.getActualMatrix();
  const $gridPadre = $(".escenario.juego .grid");
  const $gridContenedor = $(".escenario.juego .grid-juego");

  // Obtenemos los valores minimos en el que el mapa puede ejecutarse
  const maximoAncho = Math.min($gridPadre.clientWidth, $gridContenedor.clientWidth);
  const maximoAltura = Math.min($gridPadre.clientHeight, $gridContenedor.clientHeight);

  // Las matríces funcionan por [fila][columna], en el caso de posiciones mátematicas o de lienzo, debería ser
  // [y][x], por esta razón el ancho será las columnas que hayan en una fila y la altura la cantidad de filasd que hayan
  // además, se multiplica por 16 pixeles porqué este es el tamaño de las imagenes
  let ancho = nuevoMapa[0].length * 16;
  let altura = nuevoMapa.length * 16;

  // Veamos en que dimension podemos multiplicar el lienzo, para verlo de mejor manera
  let anchoEscalado;
  let alturaEscalado;

  // Vamos a validar cuál de las dimensiones es menor al máximo que se puede y con esto
  // ya podríamos optimizarlo según el dispositivo
  for (var i = 5; i >= 2; i--) {
    anchoEscalado = ancho * i;
    alturaEscalado = altura * i;
    if (i == 2 || (anchoEscalado <= maximoAncho && alturaEscalado <= maximoAltura)) {
      console.log("Dimencion", i);
      break;
    }
  }

  // El tamaño del lienzo en pixeles normales
  $canvas.setAttribute("width", `${ancho}px`);
  $canvas.setAttribute("height", `${altura}px`);

  // Mediante CSS hacemos el truco para mostrar el escalado
  $canvas.style.width = `${anchoEscalado}px`;
  $canvas.style.height = `${alturaEscalado}px`;
}

function ejecutarEscenarioAnimacion() {

  partida.setJugadorAnimando(true);

  const actualDireccion = partida.getActualDireccion();
  const mapa = partida.getActualMatrix();

  // Siguiente mapa
  const posX = partida.getPosicionMatrix().getX();
  const posY = partida.getPosicionMatrix().getY();
 
  // Comprobamos que no estemos reemplazando la imagen de llegada por el recorrido que hace el usuario.
  if (mapa[posY][posX] !== 'H') {
    mapa[posY][posX] = "" + actualDireccion.getI();
  }

  // Sumamos la dirección a las posiciones actuales, para conocer cuál es el siguiente X y Y
  const siguienteX = posX + actualDireccion.getSumarX();
  const siguienteY = posY + actualDireccion.getSumarY();

  // Validamos si no se ha llegado a un muro
  const llegoMuro = mapa[siguienteY][siguienteX] === "X";
  if (llegoMuro) {
    mapa[siguienteY][siguienteX] = "#";
  } else {
    partida.getPosicionMatrix().setX(siguienteX);
    partida.getPosicionMatrix().setY(siguienteY);
  }

  // Renderizamos el mapa resultante
  partida.setJugadorAnimando(false);
  renderizarMapa();

  // Ejecutamos el siguiente movimiento
  setTimeout(function() {
    ejecutarEscenarioMovimiento(llegoMuro);
  }, 300);

}

function ejecutarEscenarioMovimiento(perdidaPorMuro = false) {

  // Comprobamos que aún hayan movimientos por recorrer
  if (partida.getJugadorMovimientos().length > partida.getJugadorSgteMovimiento() && !perdidaPorMuro) {
    const siguienteDireccion = partida.getJugadorMovimientos()[partida.getJugadorSgteMovimiento()];
    partida.setActualDireccion(siguienteDireccion);
    partida.setJugadorSgteMovimiento(partida.getJugadorSgteMovimiento() + 1);
    requestAnimationFrame(ejecutarEscenarioAnimacion);
    return;
  }
  
  // Comprobamos si el jugador perdió porqué se topo con un muro
  if (perdidaPorMuro) {
    mostrarEscenarioResultado("¡TE HAS TOPADO CON UN MURO!");
    return;
  }

  // Comprobamos si la posición donde se encuentra el jugador es la posición de llegada
  // para decirle al usuario que llego a la meta
  if (partida.getActualMapa().getMatrix()[partida.getPosicionMatrix().getY()][partida.getPosicionMatrix().getX()] == "H") {
    mostrarEscenarioResultado("¡HAS LLEGADO AL HELADO!");
    return;
  }
  
  // Si los casos anteriores no se ejecutan quiere decir que no se llegó ni se topo con un muro.
  mostrarEscenarioResultado("¡NO LLEGASTE AL HELADO!");
  
}

function mostrarSiguienteMapa() {

  // Hacemos que el boton de siguiente, ya se pueda ejecutar
  $("#juego-ejecutar").disabled = false;

  // Eliminamos todos los movimientos que han sido puestos en la cajita de movimientos
  const elementos = $$("#juego-grid-final-movimientos li");
  for (var elemento of elementos) {
    elemento.remove();
  }

  // Avanzamos al siguiente mapa
  partida.setActualMapaIndex(partida.getActualMapaIndex() + 1);

  // Comprobamos si ese mapa ya ha sido el último de todos los mapas
  // si no, debemos ejecutar el escenario del siguiente mapa
  if (partida.getActualMapaIndex() >= Mapas.length) {
    mostrarEscenarioPreguntas();
  } else {
    mostrarEscenarioMapa(Mapas[partida.getActualMapaIndex()]);
  }

}

function mostrarEscenarioResultado(texto, animacion = 5) {

  // Cambiamos el texto que se mostra.
  $("#resultado-texto").innerText = texto;

  // Cambiamos la imagen que tenemos en el resultado por la imagen que genera el canvas
  const $imagenMapa = $("#resultado-mapa");
  $imagenMapa.style.width = $canvas.clientWidth + "px";
  $imagenMapa.style.height = $canvas.clientHeight + "px";
  $imagenMapa.src = $canvas.toDataURL();

  // Iniciamos el sistema de tiempo
  const $textoProgreso = $("#resultado-progreso p");
  const $actualProgreso = $("#resultado-progreso-actual");
  $textoProgreso.innerText = `Siguiente pregunta en ${animacion}s`;
  $actualProgreso.style.width = "0%";

  // Cambiamos el escenario
  cambiarEscenario("resultado");

  // Creamos el tiempo de animación (se crea en milisegundos)
  const tiempoMaximoAnimacion = animacion * 1000;
  var tiempoAnimacion = 0;

  var ticks = 0;
  const intervaloId = setInterval(function () {

    // Calculamos el porcentaje de progreso para mostrarlo en la animación
    tiempoAnimacion += 100;
    var actualPorcentaje = (tiempoAnimacion / tiempoMaximoAnimacion) * 100;
    $actualProgreso.style.width = `${actualPorcentaje}%`;

    // Si el tiempo ya supero al tiempo máximo, quiere decir que se debe mostrar el siguiente mapa.
    if (tiempoAnimacion >= tiempoMaximoAnimacion) {
      mostrarSiguienteMapa();
      clearInterval(intervaloId);
      return;
    }

    if (ticks == 10) {
      animacion--;
      ticks = 0;
      $textoProgreso.innerText = `Siguiente pregunta en ${animacion}s`;
    } else {
      ticks++;
    }
  }, 100);
}

// Esta función comprobará los movimientos establecidos,
// esto para nos sirve para que sepamos de ante-mano que el sistema
// llega donde es necesario.
function comprobarCamino(movimientos) {

  // Iniciamos desde la posición inicial del mapa
  var posicionX = partida.getPosicionMatrix().getX();
  var posicionY = partida.getPosicionMatrix().getY();

  // Recorremos todos los movimientos
  for (var movimiento of movimientos) {
    
    // Comprobamos si la siguiente posición (actualPosicion + direccion)
    var sgtePosX = movimiento.getSumarX() + posicionX;
    var sgtePosY = movimiento.getSumarY() + posicionY;
    var caracter = partida.getActualMapa().getMatrix()[sgtePosY][sgtePosX];

    // Validamos que el camino que se está siguiendo sea vacío de lo contrario esta función
    // retornaria false
    if (caracter != " " && caracter != "H") {
      return false;
    }

    posicionX = sgtePosX;
    posicionY = sgtePosY;
  }

  // Comprobamos la última posición a la que llego el usuario
  // para conocer si llego a la posición final
  return partida.getActualMapa().getMatrix()[posicionY][posicionX] == "H";
}

function ejecutarEscenarioMapa() {

  // Convertimos los movimientos seleccionados por el usuario,
  // a las direcciones que recibe el juego
  const movimientos = [];
  const elementos = $$("#juego-grid-final-movimientos li");
  for (var elemento of elementos) {
    movimientos.push(Direcciones[parseInt(elemento.getAttribute("data-movimiento"))]);
  }

  const jugador_id = jugador.getInfo().id;
  const actualPregunta = jugador.getPregunta();
  const esMapaGanado = comprobarCamino(movimientos);

  // Guardamos el camino en cacheo, para que posteriormente lo usemos en el resumen
  jugador.getNiveles().push({
    numero: actualPregunta,
    estado: esMapaGanado,
    pasos: jugador.getPasos(),
  });

  // Enviamos la información al servidor,
  // para que no ocurra ningún fallo o traspaso
  // de información
  axios
    .post("/api/jugadores/mapa", {
      jugador_id: jugador_id,
      numero: actualPregunta,
      pasos: jugador.getPasos(),
      estado: esMapaGanado,
    })
    .then((respuesta) => {
      
      // Reiniciamos los datos del jugador, en el almacenamiento local
      jugador.setPregunta(actualPregunta + 1);
      jugador.setPasos([]);

      // Iniciamos la animación del jugador
      partida.reiniciarJugadorMovimientos(movimientos);
      ejecutarEscenarioMovimiento();

    })
    .catch(() => {
      alert("¡Ha ocurrido un error inesperado!");
      localStorage.clear();
      window.location.reload();
    });
}

function guardarMovimientos() {
  const movimientos = [];

  // Obtenemos todos los movimientos y los convertimos en númerico para guardarlos
  const elementos = $$("#juego-grid-final-movimientos li");
  for (var elemento of elementos) {
    movimientos.push(parseInt(elemento.getAttribute("data-movimiento")));
  }

  // Guardamos los pasos actuales
  jugador.setPasos(movimientos);
}

async function mostrarEscenarioPreguntas() {
  
  // Recorremos todas las preguntas existentes
  for (var nivel of jugador.getNiveles()) {
    const indice = nivel.numero - 1;
    const mapa = Mapas[indice];
    const nuevoMapa = [...mapa.getMatrix()];

    var ultimaDireccion = mapa.getDireccionInicial().getI();
    var posicionX = mapa.getUbicacionInicial().getX();
    var posicionY = mapa.getUbicacionInicial().getY();
    for (var movimientoId of nivel.pasos) {
      ultimaDireccion = movimientoId;
      const movimiento = Direcciones[movimientoId];
      var sgtePosX = movimiento.getSumarX() + posicionX;
      var sgtePosY = movimiento.getSumarY() + posicionY;

      nuevoMapa[posicionY][posicionX] = "" + movimientoId;
      if (mapa.getMatrix()[sgtePosY][sgtePosX] != " ") {
        nuevoMapa[sgtePosY][sgtePosX] = "#";
        break;
      }

      posicionX = sgtePosX;
      posicionY = sgtePosY;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = nuevoMapa[0].length * 16;
    canvas.height = nuevoMapa.length * 16;
    await renderizarCanvas(
      context,
      nuevoMapa,
      posicionX * 16,
      posicionY * 16,
      ultimaDireccion
    );

    const imagen = $(`.pregunta-respuesta[data-numero='${nivel.numero}'] img`);
    imagen.style.width = `calc(${canvas.width}px * 2)`;
    imagen.src = canvas.toDataURL();

    const componente = $(`.pregunta-respuesta[data-numero='${nivel.numero}']`);
    componente.classList.remove("correcto");
    componente.classList.remove("incorrecto");

    const componentEstado = $(
      `.pregunta-respuesta[data-numero='${nivel.numero}'] p`
    );

    if (nivel.estado) {
      componente.classList.add("correcto");
      componentEstado.innerText = "RESPUESTA CORRECTA";
    } else {
      componente.classList.add("incorrecto");
      componentEstado.innerText = "RESPUESTA INCORRECTA";
    }
  }
  cambiarEscenario("preguntas");
}

async function main() {

  // Ejecutar el mapa actual
  $("#juego-ejecutar").addEventListener("click", (evento) => {
    evento.target.disabled = true;
    ejecutarEscenarioMapa();
  });

  // Mostrar el resulmen
  $("#preguntas-siguiente-boton").addEventListener("click", (evento) => {
    $("#preguntas-contenedor").classList.add("activo");
    evento.preventDefault();
    evento.target.remove();
    window.scrollTo(0, 0);
  });

  // Controlamos las preguntas de satisfacción y sus respectivas respuestas del resumen 
  $("#preguntas-contenedor").addEventListener("click", (evento) => {
    evento.preventDefault();
    const elemento = evento.target;

    // Validamos si lo que se está interactuando es un boton
    if (elemento.classList.contains("preguntas-contendor-satisfacion-elem__button")) {
      const elementoAnteActivo = elemento.parentNode.querySelector(".preguntas-contendor-satisfacion-elem__button.activo");
      if (elementoAnteActivo) {
        elementoAnteActivo.classList.remove("activo");
      }
      elemento.classList.add("activo");
      return;
    }
    
    // Validamos si el boton terminar es el que se está ejecutando
    if (elemento.id === "preguntas-terminar-boton") {
      
      const preguntas = $$(".preguntas-contendor-satisfacion-elem");
      const respuestas = [];

      // Recorremos todas las preguntas que existen
      for (var pregunta of preguntas) {

        // Encontramos el número de la pregunta
        const numPregunta = parseInt(pregunta.getAttribute("data-pregunta"));

        // Buscamos si tiene una respuesta activa
        const respuestaActiva = pregunta.querySelector("button.activo");
        
        // Validamos que la pregunta tenga una respuesta, si no avisamos
        if (!respuestaActiva) {
          pregunta.classList.add("error");
          alert(
            "¡Debes responder a la pregunta #" +
              numPregunta +
              " correspondiente!"
          );
          return;
        }

        // Eliminamos por seguridad la clase error y además, agregamos a la lista de preguntas
        // el formato correspondiente para enviarlo al servidor
        pregunta.classList.remove("error");
        respuestas.push({
          numero: numPregunta,
          respuesta: parseInt(respuestaActiva.innerText),
        });
        
      }

      // Enviamos toda la información y avisamos que se ha terminado el test,
      // continuamos a llevamos al apartado de estadísticas
      axios
        .post("/api/jugadores/pregunta", {
          jugador_id: jugador.getInfo().id,
          respuestas,
        })
        .then(() => {
          alert(
            "¡Has terminado el test! Muchas gracias por participar, te llevaremos a las estadísticas generales."
          );
          localStorage.clear();
          window.location.assign("/estadisticas");
        })
        .catch(() => {
          alert("¡Ha ocurrido un error! Recarga la página.");
        });
    }
  });

  // Boton de eliminar un movimiento
  $("#juego-grid-final-movimientos").addEventListener("click", (evento) => {
    const elemento = evento.target;

    // Validamos que sea un boton que es un movimiento
    if (elemento.classList.contains("juego-elemento-info-boton")) {
      elemento.parentNode.parentNode.remove();
      guardarMovimientos();
    }
  });

  // Creación de movimientos
  $("#juego-grid-movimientos").addEventListener("click", (evento) => {
    evento.preventDefault();

    var elemento = evento.target;

    // Validamos si se le ha dado click a una imagen
    // esto es para que se tome como prioridad su padre
    // y no la imagen que no tiene información 
    if (elemento.nodeName.toLowerCase() === "img") {
      elemento = elemento.parentNode.parentNode;
    }

    // Validamos que el elemento sea un movimiento valido
    if (elemento.hasAttribute("data-movimiento")) {

      // Clonamos el elemento (movimiento)
      const elementoClonado = elemento.cloneNode(true);

      // Agregamos la clase para mostrar toda la información y no solo la imagen
      elementoClonado.classList.add("info");

      // Seleccionamos la caja de movimientos y agregamos al final el elemento creado
      const movimientos = $("#juego-grid-final-movimientos");
      movimientos.appendChild(elementoClonado);
      movimientos.scrollTop = movimientos.scrollHeight;

      guardarMovimientos();
    }
  });

  // Formulario de Creación
  $("#inicio-contenedor-form").addEventListener("submit", function (evento) {
    evento.preventDefault();

    // Validamos que el nombre cumpla al menos algunas cosas
    const nombre = $("#inicio-nombre-usuario").value;
    if (nombre.trim().length < 3) {
      alert("¡El nombre minimo debe ser por lo menos 3 carácteres!");
      return;
    }

    // Enviamos la información al servidor, para su creación
    axios
      .post("/api/jugadores", {
        jugador: nombre,
      })
      .then((respuesta) => {
        if (respuesta.data) {

          // Validamos que el servidor nos haya dejado crear el usuario o no
          if (respuesta.data.error === "EXISTE_JUGADOR") {

            alert("¡El nombre de jugador está siendo usado!");
          } else {

            // Actualizamos la información local y ejecutamos el juego por primera vez
            jugador.setInfo(respuesta.data.success);
            jugador.setPregunta(1);
            jugador.setPasos([]);
            mostrarEscenarioMapa(Mapas[0]);
          }

        }
      });
  });

  // Esto sirve para que las cajitas que estén ya dentro como un movimiento se puedan mover de
  // manera libre entre ellos mismos
  new Sortable($("#juego-grid-final-movimientos"), {
    group: {
      name: "shared",
      pull: false,
    },
    onSort() {
      guardarMovimientos();
    },
    animation: 150,
  });

  // Cargamos todos los datos existentes en la información del servidor y del navegador
  await jugador.cargar();

  // Si el jugador es nuevo, deberemos mostrar el escenario principal del juego,
  // para que así haga el procedimiento de ingresar correctamente.
  if (jugador.isNuevo()) {
    cambiarEscenario("inicio");
    return;
  }

  // Si el estado guardado anteriormente es mayor a los mapas
  // debe ir al escenario final, donde se mostrará el resumen
  // y las preguntas de satisfacción.
  if (jugador.getPregunta() > Mapas.length) {
    mostrarEscenarioPreguntas();
  } else {


    // Cargar movimientos
    const movimientosArreglo = jugador.getPasos();
    const $movimientos = $("#juego-grid-final-movimientos");
    for (var movimientoId of movimientosArreglo) {
      
      // Obtenemos el boton que pertenece a ese movimiento
      const $movimientoBoton = $("[data-movimiento='" + movimientoId + "']");

      // Organizamos para que nos de la información correspondiente y no solo se la imagen
      const elementoClonado = $movimientoBoton.cloneNode(true);
      elementoClonado.classList.add("info");
      $movimientos.appendChild(elementoClonado);

    }

    // Colocamos los datos necesarios para que el juego
    // sepa en que mapa se encuentra
    partida.setActualMapaIndex(jugador.getPregunta() - 1);
    mostrarEscenarioMapa(Mapas[jugador.getPregunta() - 1]);

  }
}

main();
