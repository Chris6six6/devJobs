const mongoose = require('mongoose');
const { check, body, validationResult } = require('express-validator');
const Usuarios = mongoose.model('Usuarios');
const multer = require('multer');
const shortid = require('shortid');
const path = require('path');

exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) {
        if (error) {
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es mayor a 100kb');
                }
                else {
                    req.flash('error', error.message);
                }
            }
            else {
                req.flash('error', error.message);
            }
            res.redirect('/administracion');
            return;
        }
        else {
            return next();
        }
    });

}

// Opciones de multer
const configuracionMulter = {
    limits: { fileSize: 1000000 },
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, '../public/uploads/perfiles'));
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            // El callback se ejecuta como true cuando la imagen es aceptada
            cb(null, true);
        } else {
            cb(new Error('Formato no válido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

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

//Validar y sanitizar el formulario de editar perfil
exports.validarPerfil = async (req, res, next) => {
    //sanitizar los campos
    const rules = [
        check('nombre').not().isEmpty().withMessage('El nombre es obligatorio').escape(),
        check('email').isEmail().withMessage('El email es obligatorio').normalizeEmail()
    ];
 
    await Promise.all(rules.map(validation => validation.run(req)));
    const errores = validationResult(req);
    //si hay errores
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));
        res.render('editar-perfil', {
            nombrePagina: 'Edita tu perfil en DevJobs',
            usuario: req.user.toObject(),
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        })
        return;
    }
 
    //si toda la validacion es correcta
    next();
}

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

// Formulario para iniciar sesion
exports.formIniciarSesion = (req, res) => {
    res.render('Iniciar-sesion', { 
        nombrePagina: 'Iniciar sesion devJobs'
    })
}

// Form editar el perfil
exports.formEditarPerfil = (req, res) => {
    res.render('editar-perfil', {
        nombrePagina: 'Editar tu perfil en devJobs',
        usuario: req.user,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

// Guardar cambios esditar perfil
exports.editarPerfil = async(req, res) => {
    const usuario = await Usuarios.findById(req.user._id);

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;

    if(req.body.password) {
        usuario.password = req.body.password;
    }

    if(req.file) {
        usuario.imagen = req.file.filename;
    }

    await usuario.save();

    // Alerta
    req.flash('correcto', 'Cambios guardados correctamente');

    res.redirect('/administracion')
}

//Validar y sanitizar el formulario de editar perfil
exports.validarPerfil = async (req, res, next) => {
    //sanitizar los campos
    const rules = [
        check('nombre').not().isEmpty().withMessage('El nombre es obligatorio').escape(),
        check('email').isEmail().withMessage('El email es obligatorio').normalizeEmail()
    ];
 
    await Promise.all(rules.map(validation => validation.run(req)));
    const errores = validationResult(req);
    //si hay errores
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));
        res.render('editar-perfil', {
            nombrePagina: 'Edita tu perfil en DevJobs',
            usuario: req.user.toObject(),
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen,
            mensajes: req.flash()
        })
        return;
    }
 
    //si toda la validacion es correcta
    next();
}