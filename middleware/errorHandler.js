/**
 * ==========================================================
 * MIDDLEWARE DE ERRORES
 * ==========================================================
 */

function errorHandler(
    error,
    req,
    res,
    next
) {

    console.log(error);

    res.status(500).json({

        mensaje:
            "Error interno del servidor"

    });

}

module.exports =
    errorHandler;