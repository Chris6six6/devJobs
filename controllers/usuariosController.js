const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Usuarios = mongoose.model('Usuarios');

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Comienza tu cuenta en devJobs',
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta'
    });
};

exports.validarRegistro = [
    // Sanitizar and Validar
    body('nombre').trim().escape().notEmpty().withMessage('El nombre es obligatorio'),
    body('email').trim().escape().isEmail().withMessage('El email debe ser valido'),
    body('password').trim().escape().notEmpty().withMessage('El password no debe ir vacio'),
    body('confirmar').trim().escape().notEmpty().withMessage('Confirmar password es obligatorio'),
    body('confirmar').custom((value, { req }) => value === req.body.password).withMessage('El password no coincide'),

    (req, res, next) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            req.flash('error', errores.array().map(error => error.msg));

            return res.render('crear-cuenta', {
                nombrePagina: 'Crea tu cuenta en devJobs',
                tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
                mensajes: req.flash()
            });
        }

        // Si toda la validacion es correcta
        next();
    }
];

exports.crearUsuario = async (req, res, next) => {
    // Crear el usuario
    const usuario = new Usuarios(req.body);

    try {
        await usuario.save();
        res.redirect('/iniciar-sesion');
    } catch (error) {
        req.flash('error', error);
        res.redirect('/crear-cuenta');
    }
};

exports.formIniciarSesion = (req, res) => {
    res.render('Iniciar-sesion', { 
        nombrePagina: 'Iniciar sesion devJobs'
    })
}