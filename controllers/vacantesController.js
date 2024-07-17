exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva vacante',
        tagLine: 'Llena el formulario y publica tu vacante'
    })
}