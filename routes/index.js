const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController.js');
const vacantesController = require('../controllers/vacantesController.js');
const usuariosController = require('../controllers/usuariosController.js');
const authController = require('../controllers/authController.js');

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos);

    // Crear vacantes
    router.get('/vacantes/nueva', 
        authController.verificarUsuario,
        vacantesController.formularioNuevaVacante);

    router.post('/vacantes/nueva', 
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.agregarVacante);

    // Mostrar vacante 
    router.get('/vacantes/:url', vacantesController.mostrarVacante);

    // Editar vacante
    router.get('/vacantes/editar/:url', 
        authController.verificarUsuarioId,
        vacantesController.formEditarVacante);
    
    router.post('/vacantes/editar/:url', 
        authController.verificarUsuarioId,
        vacantesController.validarVacante,
        vacantesController.editarVacante);

    // Crear cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', 
        usuariosController.validarRegistro,
        usuariosController.crearUsuario);

    // Autenticar Usuarios
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);

    // Cerrar sesion
    router.get('/cerrar-sesion',
        authController.verificarUsuario,
        authController.cerrarSesion
    );

    // Panel de administracion
    router.get('/administracion', 
        authController.verificarUsuario,
        authController.mostrarPanel
    );

    // Editar perfil
    router.get('/editar-perfil',
        authController.verificarUsuario,
        usuariosController.formEditarPerfil
    );
    router.post('/editar-perfil',
        authController.verificarUsuario,
        //usuariosController.validarPerfil,
        usuariosController.subirImagen,
        usuariosController.editarPerfil
    );

    // Eliminar vacantes
    router.delete('/vacantes/eliminar/:id', 
        vacantesController.eliminarVacante
    );

    return router;
}