/**
 * ==========================================================
 * MIDDLEWARE DE AUTENTICACIÓN
 * ==========================================================
 */

const jwt = require("jsonwebtoken");

const SECRET_KEY = "CLAVE_SECRETA_ACTIVIDAD3";

function auth(req, res, next) {

    try {

        const authHeader =
            req.headers.authorization;

        if (!authHeader) {

            return res
                .status(401)
                .json({
                    mensaje:
                        "Token requerido"
                });

        }

        const token =
            authHeader.split(" ")[1];

        const usuario =
            jwt.verify(
                token,
                SECRET_KEY
            );

        req.usuario =
            usuario;

        next();

    } catch (error) {

        return res
            .status(401)
            .json({
                mensaje:
                    "Token inválido"
            });

    }

}

module.exports = auth;