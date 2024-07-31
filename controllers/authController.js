const passport = require('passport');
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');

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
