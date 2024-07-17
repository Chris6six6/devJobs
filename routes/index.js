const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController.js');
const vacantesController = require('../controllers/vacantesController.js');

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos);

    // Crear vacantes
    router.get('/vacantes/nueva',
        vacantesController.formularioNuevaVacante
    );

    return router;
}