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
        vacantes
    })
}