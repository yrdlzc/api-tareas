/**
 * ==========================================================
 * API RESTFUL DE TAREAS
 * ==========================================================
 * Actividad 3
 * Node.js + Express.js + fs.promises + JWT + bcryptjs
 * ==========================================================
 */

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs").promises;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const auth = require("./middleware/auth");
const errorHandler = require("./middleware/errorHandler");

const app = express();

const PORT = 3000;

const SECRET_KEY = "CLAVE_SECRETA_ACTIVIDAD3";

/**
 * ----------------------------------------------------------
 * MIDDLEWARES
 * ----------------------------------------------------------
 */

app.use(bodyParser.json());

/**
 * ----------------------------------------------------------
 * ARCHIVOS JSON
 * ----------------------------------------------------------
 */

const TAREAS_FILE = "./data/tareas.json";
const USUARIOS_FILE = "./data/usuarios.json";

/**
 * ----------------------------------------------------------
 * FUNCIONES DE TAREAS
 * ----------------------------------------------------------
 */

async function leerTareas() {

    const data =
        await fs.readFile(
            TAREAS_FILE,
            "utf8"
        );

    return JSON.parse(data);

}

async function guardarTareas(tareas) {

    await fs.writeFile(
        TAREAS_FILE,
        JSON.stringify(
            tareas,
            null,
            2
        )
    );

}

/**
 * ----------------------------------------------------------
 * FUNCIONES DE USUARIOS
 * ----------------------------------------------------------
 */

async function leerUsuarios() {

    const data =
        await fs.readFile(
            USUARIOS_FILE,
            "utf8"
        );

    return JSON.parse(data);

}

async function guardarUsuarios(usuarios) {

    await fs.writeFile(
        USUARIOS_FILE,
        JSON.stringify(
            usuarios,
            null,
            2
        )
    );

}

/**
 * ----------------------------------------------------------
 * RUTA PRINCIPAL
 * ----------------------------------------------------------
 */

app.get("/", (req, res) => {

    res.json({

        mensaje:
            "API funcionando correctamente"

    });

});

/**
 * ----------------------------------------------------------
 * REGISTER
 * ----------------------------------------------------------
 */

app.post("/register", async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;

        if (
            !username ||
            !password
        ) {

            return res
                .status(400)
                .json({

                    mensaje:
                        "Usuario y contraseña son obligatorios"

                });

        }

        const usuarios =
            await leerUsuarios();

        const existe =
            usuarios.find(
                usuario =>
                    usuario.username === username
            );

        if (existe) {

            return res
                .status(400)
                .json({

                    mensaje:
                        "Usuario ya existe"

                });

        }

        const passwordHash =
            await bcrypt.hash(
                password,
                10
            );

        const nuevoUsuario = {

            username,

            password:
                passwordHash

        };

        usuarios.push(
            nuevoUsuario
        );

        await guardarUsuarios(
            usuarios
        );

        res.status(201).json({

            mensaje:
                "Usuario registrado correctamente"

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            mensaje:
                "Error al registrar usuario"

        });

    }

});

/**
 * ----------------------------------------------------------
 * LOGIN
 * ----------------------------------------------------------
 */

app.post("/login", async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;

        const usuarios =
            await leerUsuarios();

        const usuario =
            usuarios.find(
                usuario =>
                    usuario.username === username
            );

        if (!usuario) {

            return res
                .status(401)
                .json({

                    mensaje:
                        "Usuario no encontrado"

                });

        }

        const coincide =
            await bcrypt.compare(
                password,
                usuario.password
            );

        if (!coincide) {

            return res
                .status(401)
                .json({

                    mensaje:
                        "Contraseña incorrecta"

                });

        }

        const token =
            jwt.sign(
                {
                    username
                },
                SECRET_KEY,
                {
                    expiresIn:
                        "1h"
                }
            );

        res.json({

            mensaje:
                "Login exitoso",

            token

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            mensaje:
                "Error en login"

        });

    }

});

/**
 * ----------------------------------------------------------
 * GET TAREAS
 * RUTA PROTEGIDA
 * ----------------------------------------------------------
 */

app.get(
    "/tareas",
    auth,
    async (req, res) => {

        const tareas =
            await leerTareas();

        res.json(
            tareas
        );

    }
);

/**
 * ----------------------------------------------------------
 * POST TAREAS
 * RUTA PROTEGIDA
 * ----------------------------------------------------------
 */

app.post(
    "/tareas",
    auth,
    async (req, res) => {

        const tareas =
            await leerTareas();

        const nuevaTarea = {

            id:
                Date.now(),

            titulo:
                req.body.titulo,

            descripcion:
                req.body.descripcion

        };

        tareas.push(
            nuevaTarea
        );

        await guardarTareas(
            tareas
        );

        res.status(201).json(
            nuevaTarea
        );

    }
);

/**
 * ----------------------------------------------------------
 * PUT TAREAS
 * RUTA PROTEGIDA
 * ----------------------------------------------------------
 */

app.put(
    "/tareas/:id",
    auth,
    async (req, res) => {

        const id =
            Number(
                req.params.id
            );

        const tareas =
            await leerTareas();

        const indice =
            tareas.findIndex(
                tarea =>
                    tarea.id === id
            );

        if (indice === -1) {

            return res
                .status(404)
                .json({

                    mensaje:
                        "Tarea no encontrada"

                });

        }

        tareas[indice] = {

            ...tareas[indice],

            titulo:
                req.body.titulo,

            descripcion:
                req.body.descripcion

        };

        await guardarTareas(
            tareas
        );

        res.json(
            tareas[indice]
        );

    }
);

/**
 * ----------------------------------------------------------
 * DELETE TAREAS
 * RUTA PROTEGIDA
 * ----------------------------------------------------------
 */

app.delete(
    "/tareas/:id",
    auth,
    async (req, res) => {

        const id =
            Number(
                req.params.id
            );

        const tareas =
            await leerTareas();

        const tareasFiltradas =
            tareas.filter(
                tarea =>
                    tarea.id !== id
            );

        await guardarTareas(
            tareasFiltradas
        );

        res.json({

            mensaje:
                "Tarea eliminada correctamente"

        });

    }
);

/**
 * ----------------------------------------------------------
 * MIDDLEWARE DE ERRORES
 * ----------------------------------------------------------
 */

app.use(errorHandler);

/**
 * ----------------------------------------------------------
 * SERVIDOR
 * ----------------------------------------------------------
 */

app.listen(PORT, () => {

    console.log(
        `Servidor ejecutándose en puerto ${PORT}`
    );

});