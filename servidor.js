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

app.get("/api/estadisticas/general", async function (peticion, respuesta) {
  const resultado = await dbQuery(
    `SELECT mapa.numero, mapa.estado, COUNT(jugador_id) AS cantidad
    FROM Jugador jugador
    INNER JOIN Mapa mapa ON mapa.jugador_id = jugador.id
    WHERE jugador.estado = 1
    GROUP BY mapa.estado, mapa.numero;`
  );
  const objetos = [];
  for (var objeto of resultado) {
    var indice = objeto.numero - 1;
    var elemento = objetos[indice];
    if (!elemento) {
      elemento = objetos[indice] = {
        numero: objeto.numero,
        correctos: 0,
        incorrectos: 0,
      };
    }
    if (objeto.estado) {
      elemento.correctos = objeto.cantidad;
    } else {
      elemento.incorrectos = objeto.cantidad;
    }
  }
  respuesta.json(objetos);
});

app.get("/api/jugadores/:id", async function (peticion, respuesta) {
  if (!(peticion.params && peticion.params.id)) {
    respuesta.status(400).end();
    return;
  }
  const resultado = await dbQuery(`SELECT * FROM Mapa WHERE jugador_id = ${peticion.params.id}`);
  respuesta.json({
    success: resultado.map((x) => {
      return { numero: x.numero, estado: x.estado, pasos: JSON.parse(x.pasos) };
    }),
  });
});

app.post("/api/jugadores/pregunta", async function (peticion, respuesta) {
  if (
    !(
      peticion.body &&
      peticion.body.hasOwnProperty("jugador_id") &&
      peticion.body.hasOwnProperty("respuestas")
    )
  ) {
    respuesta.status(400).end();
    return;
  }

  const lineas = [];
  for (var lineaInsert of peticion.body.respuestas) {
    lineas.push(
      `(${peticion.body.jugador_id}, ${lineaInsert.numero}, ${lineaInsert.respuesta})`
    );
  }

  const resultadoPreguntas = await dbQuery(`INSERT INTO Pregunta (jugador_id, numero, satisfaccion) VALUES ${lineas.join(",")};`);
  const resultadoJugador = await dbQuery(`UPDATE Jugador SET estado = 1 WHERE id = ${peticion.body.jugador_id}`);

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

app.post("/api/jugadores/mapa", async function (peticion, respuesta) {
  if (
    !(
      peticion.body &&
      peticion.body.hasOwnProperty("jugador_id") &&
      peticion.body.hasOwnProperty("numero") &&
      peticion.body.hasOwnProperty("pasos") &&
      peticion.body.hasOwnProperty("estado")
    )
  ) {
    respuesta.status(400).end();
    return;
  }

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
  if (!(peticion.body && peticion.body.jugador)) {
    respuesta.status(400).end();
    return;
  }

  var nombre = peticion.body.jugador;
  nombre = nombre.replaceAll("  ", " ").trim();

  const resultado = await dbQuery(`SELECT fecha, estado FROM Jugador WHERE LOWER(nombre) = '${nombre.toLowerCase()}'`);
  var nuevoJugador = resultado.length == 0;
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

app.use("/public", serveStatic(path.join(__dirname, "src/public"), {index: false}));

app.get("/estadisticas", function (peticion, respuesta) {
  respuesta.sendFile(__dirname + "/src/estadisticas.html");
});

app.get("/", function (peticion, respuesta) {
  respuesta.sendFile(__dirname + "/src/index.html");
});

app.use("*", function (peticion, respuesta) {
  respuesta.redirect("/");
});

app.listen(80);
