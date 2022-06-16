/*

Presentado por:
- Henry Guillen Ramirez
- Luis Alfredo Gonzalez Jimenez
- Juan Esteban Chacon
- Cristian Camilo Guevara López

*/

String.prototype.replaceAll = function (search, replacement = "") {
  var target = this;
  return target.split(search).join(replacement);
};

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const serveStatic = require("serve-static");
const mysql = require("mysql");

// Crear conexión a MYSQL
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "149.56.107.144",
  user: "app",
  password: "12345",
  database: "algoritmos",
});

app.use(bodyParser.json());

// Función para la creación de sentencias en la base de datos.
function dbQuery(sentencia) {
  return new Promise(function (resolver, denegar) {
    pool.query(sentencia, function (error, resultados, fields) {
      if (error) {
        console.log(error);
        resolver([]);
        return;
      } else {
        resolver(resultados);
      }
    });
  });
}

// Función de coeficiente de correlación
app.get("/api/estadisticas/coeficiente/:n/:p", async function (peticion, respuesta) {

  // Peticiones totales  
  const preguntas = await dbQuery("SELECT p.satisfaccion AS valor FROM Jugador j INNER JOIN Pregunta p ON p.jugador_id = j.id WHERE p.numero = " + peticion.params.p + " AND j.estado = 1;");
  const niveles = await dbQuery("SELECT m.estado AS valor FROM Jugador j INNER JOIN Mapa m ON m.jugador_id = j.id WHERE m.numero = " + peticion.params.n + " AND j.estado = 1;");
  
  // Variables globales
  var suma = 0;
  var mediaX = 0;
  var mediaY = 0;

  for (var registro of preguntas) {
    suma += registro.valor;
  }
  mediaX = suma / preguntas.length;
  suma = 0;

  for (var registro of niveles) {
    suma += registro.valor;
  }
  mediaY = suma / niveles.length;
  suma = 0;

  var pxy, sx2, sy2;
  pxy= sx2= sy2= 0;
  for(var i = 0; i < preguntas.length; i++) {
    pxy += (preguntas[i].valor-mediaX) * (niveles[i].valor-mediaY);
    sx2 += (preguntas[i].valor-mediaX) * (preguntas[i].valor-mediaX);
    sy2 += (niveles[i].valor-mediaY) * (niveles[i].valor-mediaY);
  }

  var b = Math.sqrt(sx2*sy2);
  if (b == 0) {
    respuesta.json({error: true});
    return;
  }

  respuesta.json({resultado: (pxy / b)})

});

// Función para el cálculo de estadísticas de preguntas
app.get("/api/estadisticas/preguntas", async function (peticion, respuesta) {
  respuesta.json(await dbQuery(
    `SELECT 
        pregunta.numero,
        MAX(pregunta.satisfaccion) AS mayor,
        MIN(pregunta.satisfaccion) AS menor,
        AVG(pregunta.satisfaccion) AS promedio,
        COUNT(pregunta.satisfaccion) AS cantidad
    FROM Jugador jugador
    INNER JOIN Pregunta pregunta ON pregunta.jugador_id = jugador.id
    WHERE jugador.estado = 1
    GROUP BY pregunta.numero
    ORDER BY pregunta.numero;`
  ));
});

// Función para el cálculo del top en base a los jugadores
app.get("/api/estadisticas/top", async function (peticion, respuesta) {
  respuesta.json(await dbQuery(
    `SELECT 
      jugador.id, 
      jugador.nombre, 
      SUM(mapa.estado) AS correctas, 
      MAX(mapa.numero) - SUM(mapa.estado) AS incorrectas,
      AVG(mapa.estado) AS nota
    FROM Jugador jugador
    INNER JOIN Mapa mapa ON mapa.jugador_id = jugador.id
    WHERE jugador.estado = 1
    GROUP BY jugador.id
    ORDER BY nota DESC;`
  ));
});

// Función para el cálculo de los niveles creados
app.get("/api/estadisticas/general", async function (peticion, respuesta) {
  const resultado = await dbQuery(
    `SELECT mapa.numero, mapa.estado, COUNT(jugador_id) AS cantidad
    FROM Jugador jugador
    INNER JOIN Mapa mapa ON mapa.jugador_id = jugador.id
    WHERE jugador.estado = 1
    GROUP BY mapa.estado, mapa.numero;`
  );

  // Se creará un arreglo uniendo los dos resultados que arroja la secuencia
  const objetos = [];
  for (var objeto of resultado) {

    var indice = objeto.numero - 1;
    var elemento = objetos[indice];

    // Validamos si el objeto de la pregunta no exista, se crea automáticamente
    if (!elemento) {
      elemento = objetos[indice] = {
        numero: objeto.numero,
        correctos: 0,
        incorrectos: 0,
      };
    }

    // Si el estado está activo, son la cantidad de preguntas correctas.
    if (objeto.estado) {
      elemento.correctos = objeto.cantidad;
    } else {
      elemento.incorrectos = objeto.cantidad;
    }

  }
  respuesta.json(objetos);
});

app.get("/api/jugadores/:id", async function (peticion, respuesta) {
  
  // Validamos que los datos ingresamos sean los correctos
  if (!(peticion.params && peticion.params.id)) {
    respuesta.status(400).end();
    return;
  }

  // Seleccionamos el progreso actual de las preguntas que lleva el jugador guardados en la base de datos.
  const resultado = await dbQuery(`SELECT * FROM Mapa WHERE jugador_id = ${peticion.params.id}`);
  respuesta.json({
    success: resultado.map((x) => {
      // Creamos un mapa para darle un formato mejor a la inofrmación traida de la base de datos
      return { numero: x.numero, estado: x.estado, pasos: JSON.parse(x.pasos) };
    }),
  });
  
});

app.post("/api/jugadores/pregunta", async function (peticion, respuesta) {

  // Validamos que los datos sean los correctos
  if (!(peticion.body &&peticion.body.hasOwnProperty("jugador_id") &&peticion.body.hasOwnProperty("respuestas"))) {
    respuesta.status(400).end();
    return;
  }

  // Creamos la secuencia que deberemos ejecutar crear el registro en la base de datos
  const lineas = [];
  for (var lineaInsert of peticion.body.respuestas) {
    lineas.push(
      `(${peticion.body.jugador_id}, ${lineaInsert.numero}, ${lineaInsert.respuesta})`
    );
  }
  const resultadoPreguntas = await dbQuery(`INSERT INTO Pregunta (jugador_id, numero, satisfaccion) VALUES ${lineas.join(",")};`);
  
  // Actualizamos el estado del jugador
  const resultadoJugador = await dbQuery(`UPDATE Jugador SET estado = 1 WHERE id = ${peticion.body.jugador_id}`);

  // Validamos que todo haya ocurrido según lo esperado, para proseguir al final de la partida.
  if (
    resultadoJugador &&
    resultadoJugador.affectedRows &&
    resultadoPreguntas &&
    resultadoPreguntas.affectedRows == 3
  ) {
    respuesta.json({ success: true });
    return;
  }

  respuesta.status(400).end();
});

// Función para guardar el estado de la pregunta, al estar seguro de que se ejecutará la animación
app.post("/api/jugadores/mapa", async function (peticion, respuesta) {

  // Validamos que los parametros enviados sean los correctos
  if (!(peticion.body && peticion.body.hasOwnProperty("jugador_id") && peticion.body.hasOwnProperty("numero") && peticion.body.hasOwnProperty("pasos") && peticion.body.hasOwnProperty("estado"))) {
    respuesta.status(400).end();
    return;
  }

  // Creamos el registro en la base de datos
  const resultaNuevo = await dbQuery(`INSERT INTO Mapa (jugador_id, numero, estado, pasos, cant_pasos) VALUES (${peticion.body.jugador_id}, ${peticion.body.numero}, ${peticion.body.estado}, '${JSON.stringify(peticion.body.pasos)}', ${peticion.body.pasos.length})`);

  // Se guardo correctamente
  if (resultaNuevo.insertId) {
    respuesta.json({ success: true });
  } else {
    respuesta.status(400).end();
  }

  return;
});

app.post("/api/jugadores", async function (peticion, respuesta) {

  // Validamos que los parametros enviados sean los correctos
  if (!(peticion.body && peticion.body.jugador)) {
    respuesta.status(400).end();
    return;
  }

  // Damos un formato mejor a los nombres, para que no tengamos ningún inconveniente o
  // nombres errados
  var nombre = peticion.body.jugador;
  nombre = nombre.replaceAll("  ", " ").trim();

  // Buscamos si existe algún nombre similar al ingresado
  const resultado = await dbQuery(`SELECT fecha, estado FROM Jugador WHERE LOWER(nombre) = '${nombre.toLowerCase()}'`);
  var nuevoJugador = resultado.length == 0;

  // Validamos que si el jugador que existe no ha completado el formulario y han pasado 24 horas para establecerlo como utilizable
  if (!nuevoJugador && !resultado[resultado.length - 1].estado) {
    const fechaAnterior = new Date(resultado[resultado.length - 1].fecha);
    if (Date.now() - fechaAnterior.getTime() >= 24 * 60 * 60 * 1000) {
      nuevoJugador = true;
    }
  }

  // Está vacío: entonces creamos el jugador
  if (nuevoJugador) {
    const fechaActual = new Date();
    const nuevoJugador = await dbQuery(`INSERT INTO Jugador (nombre, fecha, estado) VALUES ('${nombre}', ${JSON.stringify(fechaActual)}, false)`);
    respuesta.json({
      success: {
        id: nuevoJugador.insertId,
        nombre: nombre,
      },
    });
    return;
  }

  respuesta.json({ error: "EXISTE_JUGADOR" });
});

// Función para la exposición de archivos estáticos
app.use("/public", serveStatic(path.join(__dirname, "src/public"), {index: false}));

// Función para mostrar el archivo HTML de estadísticas
app.get("/estadisticas", function (peticion, respuesta) {
  respuesta.sendFile(__dirname + "/src/estadisticas.html");
});

// Función para mostrar el archivo HTML general
app.get("/", function (peticion, respuesta) {
  respuesta.sendFile(__dirname + "/src/index.html");
});

// Función para redireccionar en caso de no encontrar la ruta deseada
app.use("*", function (peticion, respuesta) {
  respuesta.redirect("/");
});

app.listen(80);
