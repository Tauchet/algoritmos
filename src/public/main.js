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

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

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

  // Cambiar la ubicación a nivel de lienzo (pintar para la animación)
  const posicionPixel = mapa.getUbicacionInicial().clonar();
  posicionPixel.setX(posicionPixel.getX() * 16);
  posicionPixel.setY(posicionPixel.getY() * 16 - 3);
  partida.setPosicionPixel(posicionPixel);

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

  const actualDireccion = partida.getActualDireccion();
  const mapa = partida.getActualMatrix();

  // Sumamos un pixel a la posición, para que el renderizado muestre que se estuviera movimiendo
  partida.getPosicionMatrix().setX(partida.getPosicionMatrix().getX() + actualDireccion.getSumarX());
  partida.getPosicionMatrix().setY(partida.getPosicionMatrix().getY() + actualDireccion.getSumarY());



  renderizarMapa();

}

function ejecutarEscenarioAnimacion2() {
  const actualDireccion = partida.getActualDireccion();
  const mapa = partida.getActualMatrix();

  const validacionAbajo = actualDireccion.getI() === 0 && partida.getPosicionPixel().getY() >= partida.getAnimacionPosicionFinal().getY();
  const validacionArriba = actualDireccion.getI() === 1 && partida.getPosicionPixel().getY() <= partida.getAnimacionPosicionFinal().getY();
  const validacionIzquierda = actualDireccion.getI() === 2 && partida.getPosicionPixel().getX() <= partida.getAnimacionPosicionFinal().getX();
  const validacionDerecha = actualDireccion.getI() === 3 && partida.getPosicionPixel().getX() >= partida.getAnimacionPosicionFinal().getX();

  const validarMuro = mapa[partida.getPosicionMatrix().getY()][partida.getPosicionMatrix().getX()] === "X";

  if (
    validacionArriba ||
    validacionDerecha ||
    validacionAbajo ||
    validacionIzquierda ||
    validarMuro
  ) {
    // Terminó de moverse
    partida.setJugadorAnimando(false);

    // Hacemos que si se ha pegado contra un muro, se muestre,
    // una imagen diferente, que significa que se pego contra el muro
    if (validarMuro) {
      mapa[partida.getPosicionMatrix().getY()][partida.getPosicionMatrix().getX()] = "#";
    }

    // Dejar el rastro correspondiente
    if (
      mapa[partida.getUltimaPosicionMatrix().getY()][partida.getUltimaPosicionMatrix().getX()] != "H"
    ) {
      mapa[partida.getUltimaPosicionMatrix().getY()][partida.getUltimaPosicionMatrix().getX()] = actualDireccion.getI() + "";
    }

    // Ha terminado de moverse
    requestAnimationFrame(function () {
      // Creamos una función temporal para pasar el estado si se perdió porqué llego a un muro.
      ejecutarEscenarioMovimiento(validarMuro);
    });
  } else {

    // Sumamos un pixel a la posición, para que el renderizado muestre que se estuviera movimiendo
    partida.getPosicionPixel().setX(partida.getPosicionPixel().getX() + actualDireccion.getSumarX());
    partida.getPosicionPixel().setY(partida.getPosicionPixel().getY() + actualDireccion.getSumarY());

    // Ejecutar el siguiente renderizado de movimiento, aún no ha terminado de animarse
    requestAnimationFrame(ejecutarEscenarioAnimacion);
  }

  renderizarMapa(mapa);
}

function ejecutarEscenarioMovimiento(perdidaPorMuro = false) {

  // Comprobamos que aún hayan movimientos por recorrer
  if (partida.getJugadorMovimientos().length > partida.getJugadorSgteMovimiento() && !perdidaPorMuro) {

    const siguienteDireccion = partida.getJugadorMovimientos()[partida.getJugadorSgteMovimiento()];

    // Cambiar y guardar la respectiva posición entorno a la matriz
    partida.setUltimaPosicionMatrix(partida.getPosicionMatrix().clonar());

    // Animación en base a pixeles para el lienzo
    partida.setAnimacionPosicionFinal(
      new Vector2D(
        siguienteDireccion.getSumarX() * 16 + partida.getPosicionPixel().getX(),
        siguienteDireccion.getSumarY() * 16 + partida.getPosicionPixel().getY()
      )
    );

    partida.setJugadorAnimando(true);
    partida.setActualDireccion(siguienteDireccion);
    partida.incJugadorSgteMovimiento();

    requestAnimationFrame(ejecutarEscenarioAnimacion);
  } else if (partida.getActualMapa().getMatrix()[partida.getPosicionMatrix().getY()][partida.getPosicionMatrix().getX()] == "H") {
    mostrarEscenarioResultado("¡HAS LLEGADO AL HELADO!");
  } else if (perdidaPorMuro) {
    mostrarEscenarioResultado("¡TE HAS TOPADO CON UN MURO!");
  } else {
    mostrarEscenarioResultado("¡NO LLEGASTE AL HELADO!");
  }
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
  var posicionX = partida.getPosicionMatrix().getX();
  var posicionY = partida.getPosicionMatrix().getY();
  for (var movimiento of movimientos) {
    var sgtePosX = movimiento.getSumarX() + posicionX;
    var sgtePosY = movimiento.getSumarY() + posicionY;
    var caracter = partida.getActualMapa().getMatrix()[sgtePosY][sgtePosX];
    if (caracter != " " && caracter != "H") {
      return false;
    }
    posicionX = sgtePosX;
    posicionY = sgtePosY;
  }
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

  // Iniciamos la animación del jugador
  partida.reiniciarJugadorMovimientos(movimientos);
  ejecutarEscenarioMovimiento();

  /* const jugador_id = jugador.getInfo().id;
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
    }); */
}

function guardarMovimientos() {
  const movimientos = [];
  const elementos = $$("#juego-grid-final-movimientos li");
  for (var elemento of elementos) {
    movimientos.push(parseInt(elemento.getAttribute("data-movimiento")));
  }
  jugador.setPasos(movimientos);
}

async function mostrarEscenarioPreguntas() {
  
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

  // Eventos

  // Ejecutar el mapa actual
  $("#juego-ejecutar").addEventListener("click", (evento) => {
    evento.target.disabled = true;
    ejecutarEscenarioMapa();
  });

  $("#preguntas-siguiente-boton").addEventListener("click", (evento) => {
    $("#preguntas-contenedor").classList.add("activo");
    evento.preventDefault();
    evento.target.remove();
    window.scrollTo(0, 0);
  });

  $("#preguntas-contenedor").addEventListener("click", (evento) => {
    evento.preventDefault();
    const elemento = evento.target;
    if (elemento.classList.contains("preguntas-contendor-satisfacion-elem__button")) {
      const elementoAnteActivo = elemento.parentNode.querySelector(
        ".preguntas-contendor-satisfacion-elem__button.activo"
      );

      if (elementoAnteActivo) {
        elementoAnteActivo.classList.remove("activo");
      }
      elemento.classList.add("activo");
    } else if (elemento.id === "preguntas-terminar-boton") {
      const preguntas = $$(".preguntas-contendor-satisfacion-elem");
      let completado = true;
      const respuestas = [];
      for (var pregunta of preguntas) {
        const numPregunta = parseInt(pregunta.getAttribute("data-pregunta"));
        const respuestaActiva = pregunta.querySelector("button.activo");
        pregunta.classList.add("error");
        if (!respuestaActiva) {
          alert(
            "¡Debes responder a la pregunta #" +
              numPregunta +
              " correspondiente!"
          );
          completado = false;
          break;
        }
        pregunta.classList.remove("error");
        respuestas.push({
          numero: numPregunta,
          respuesta: parseInt(respuestaActiva.innerText),
        });
      }
      if (!completado) {
        return;
      }
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

  $("#juego-grid-final-movimientos").addEventListener("click", (evento) => {
    const elemento = evento.target;
    if (elemento.classList.contains("juego-elemento-info-boton")) {
      elemento.parentNode.parentNode.remove();
      guardarMovimientos();
    }
  });

  $("#juego-grid-movimientos").addEventListener("click", (evento) => {
    evento.preventDefault();
    var elemento = evento.target;
    if (elemento.nodeName.toLowerCase() === "img") {
      elemento = elemento.parentNode.parentNode;
    }
    if (elemento.hasAttribute("data-movimiento")) {
      // Agregamos elementos.
      const elementoClonado = elemento.cloneNode(true);
      elementoClonado.classList.add("info");

      const movimientos = $("#juego-grid-final-movimientos");
      movimientos.appendChild(elementoClonado);
      movimientos.scrollTop = movimientos.scrollHeight;

      guardarMovimientos();
    }
  });

  // Formulario de Creación
  $("#inicio-contenedor-form").addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nombre = $("#inicio-nombre-usuario").value;
    if (nombre.trim().length <= 3) {
      alert("¡El nombre minimo debe ser por lo menos 3 carácteres!");
      return;
    }

    axios
      .post("/api/jugadores", {
        jugador: nombre,
      })
      .then((respuesta) => {
        if (respuesta.data) {
          if (respuesta.data.error === "EXISTE_JUGADOR") {
            alert("¡El nombre de jugador está siendo usado!");
          } else {
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
