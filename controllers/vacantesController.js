const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');

exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva vacante',
        tagLine: 'Llena el formulario y publica tu vacante'
    });
};

// Agregar las vacantes a la base de datos
exports.agregarVacante = async (req, res) => {
    try {
        const vacante = new Vacante(req.body);

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
        nombrePagina: `Editar - ${vacante.titulo}`
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
