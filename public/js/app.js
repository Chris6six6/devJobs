document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos');

    if(skills) {
        skills.addEventListener('click', agregarSkills);

        // Funcion para editar
        skillsSeleccionados();
    }
});

const skills = new Set();
const agregarSkills = e => {
    if(e.target.tagName === 'LI') {
        if(e.target.classList.contains('activo')) {
            // Quitarlo del set y quitar la clase
            skills.delete(e.target.textContent);
            e.target.classList.remove('activo');
        }
        else {
            // Agregar al set y agregar la clase
            skills.add(e.target.textContent);
            e.target.classList.add('activo');
        }
    }
    const skillsArray = [...skills];
    document.querySelector('#skills').value = skillsArray;
}

const skillsSeleccionados = () => {
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));

    seleccionadas.forEach(seleccionada => {
        skills.add(seleccionada.textContent);
    })

    // Agregarlo al input hidden
    const skillsArray = [...skills];
    document.querySelector('#skills').value = skillsArray;
}