const passport = require('passport');
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const Usuarios = mongoose.model('Usuarios');
const crypto = require('crypto');
const enviarEmail = require('../handlebars/email.js');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

// Revisar si esta autenticado
exports.verificarUsuarioId = async (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/iniciar-sesion');
    }

    try {
        const vacante = await Vacante.findOne({ url: req.params.url });

        if (!vacante) {
            return res.status(404).send('Vacante no encontrada');
        }

        if (vacante.autor.toString() !== req.user._id.toString()) {
            return res.status(403).redirect('/');
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
};
exports.verificarUsuario = (req, res, next) => {
    // Revisar si el usuario is
    if(req.isAuthenticated()) {
        return next(); // estan autenticados
    }

    // Redireccionar
    res.redirect('/iniciar-sesion');
}

exports.mostrarPanel = async(req, res) => {

    // Consultar el usuario autenticado
    const vacantes = await Vacante.find({ autor: req.user._id });

    res.render('administracion', {
        nombrePagina: 'Panel de administracion',
        tagline: 'Crea y administra tus vacantes desde aqui',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        vacantes
    })
}

exports.cerrarSesion = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).send('Error al cerrar sesión');
        }
        res.redirect('/iniciar-sesion');
    });
};

// Formulario para restablecer password
exports.formRestablecerPassword = (req, res) => {
    res.render('reestablecer-password', {
        nombrePagina: 'Restablece tu password',
        tagline: 'Si ya tienes cuenta, pero olvidaste tu password, coloca tu email'
    });
};

exports.enviarToken = async(req, res) => {
    const usuario = await Usuarios.findOne({ email: req.body.email });

    if(!usuario) {
        req.flash('error', 'No existe esa cuenta');
        return res.redirect('/iniciar-sesion');
    }

    // El usuario existe, generar token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 360000;

    // Guardar el usuario
    await usuario.save();
    const resetUrl = `http://${req.headers.host}/restablecer-password/${usuario.token}`;

    await enviarEmail.enviar({
        usuario,
        subject: 'Password reset',
        resetUrl,
        archivo: 'reset'
    });

    req.flash('correcto', 'Revisa tu email')
    res. redirect('/iniciar-sesion')
}

// Valida si el token es valido y el usuario existe, muestra la vista
exports.reestablecerPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token : req.params.token
    });

    if(!usuario) {
        req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/reestablecer-password');
    }

    // Todo bien, mostrar el formulario
    res.render('nuevo-password', {
        nombrePagina : 'Nuevo Password'
    })
}

// almacena el nuevo password en la BD
exports.guardarPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token : req.params.token
    });

    // no existe el usuario o el token es invalido
    if(!usuario) {
        req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/reestablecer-password');
    }

    // Asignar nuevo password, limpiar valores previos
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    // agregar y eliminar valores del objeto
    await usuario.save();

    // redirigir
    req.flash('correcto', 'Password Modificado Correctamente');
    res.redirect('/iniciar-sesion');
}