const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const { body, validationResult } = require('express-validator');

exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva vacante',
        tagLine: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
    });
};

// Agregar las vacantes a la base de datos
exports.agregarVacante = async (req, res) => {
    try {
        const vacante = new Vacante(req.body);

        // Usuario autor de la vacante
        vacante.autor = req.user._id;

        // Crear arreglo de habilidades (skills)
        vacante.skills = req.body.skills.split(',');

        // Almacenarlo en la base de datos
        const nuevaVacante = await vacante.save();

        // Redireccionar
        res.redirect(`/vacantes/${nuevaVacante.url}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error al agregar la vacante');
    }
};

exports.mostrarVacante = async (req, res, next) => {
    try {
        const vacante = await Vacante.findOne({ url: req.params.url });

        // Si no hay resultados
        if (!vacante) return next();

        res.render('vacante', {
            vacante,
            nombrePagina: vacante.titulo,
            barra: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error al mostrar la vacante');
    }
};

exports.formEditarVacante = async(req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url });

    if(!vacante) return next();

    res.render('editar-vacante', {
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
    })
}

exports.editarVacante = async(req, res) => {
    const vacanteActualizada = req.body;

    vacanteActualizada.skills = req.body.skills.split(',');

    const vacante = await Vacante.findOneAndUpdate( {url: req.params.url},
        vacanteActualizada, {
            new: true,
            runValidators: true
        }
    )

    res.redirect(`/vacantes/${vacante.url}`);

}

exports.validarVacante = [
    // Sanitizar and Validar
    body('titulo').trim().escape().notEmpty().withMessage('Agraga un titulo a la vanacte'),
    body('empresa').trim().escape().notEmpty().withMessage('Agrega una empresa'),
    body('ubicacion').trim().escape().notEmpty().withMessage('Agrega una ubicacion'),
    body('contrato').trim().escape().notEmpty().withMessage('Selecciona un tipo de contrato'),
    body('skills').trim().escape().notEmpty().withMessage('Selecciona al menos una skill'),

    (req, res, next) => {
    
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        // Recargar la vista con los errores
        req.flash('error', errores.array().map(error => error.msg));

        return res.render('nueva-vacante', {
            nombrePagina: 'Nueva vacante',
            tagLine: 'Llena el formulario y publica tu vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        });
    }

    next();
}];

exports.eliminarVacante = async (req, res) => {
    const { id } = req.params;

    try {
        const vacante = await Vacante.findById(id);

        if (!vacante) {
            return res.status(404).send('Vacante no encontrada');
        }

        if (verificarAutor(vacante, req.user)) {
            // Si este es el usuario, se puede eliminar
            await vacante.deleteOne();
            return res.status(200).send('Vacante eliminada correctamente');
        } else {
            // No permitido
            return res.status(403).send('No tienes permiso para eliminar esta vacante');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error interno del servidor');
    }
};

const verificarAutor = (vacante = {}, usuario = {}) => {
    return vacante.autor.equals(usuario._id);
};
