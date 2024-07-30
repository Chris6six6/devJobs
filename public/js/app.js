import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos');

    // Limpiar alertas
    let alertas = document.querySelector('.alertas');
    if (alertas) {
        limpiarAlertas();
    }

    if (skills) {
        skills.addEventListener('click', agregarSkills);

        // Funcion para editar
        skillsSeleccionados();
    }

    const vacantesListado = document.querySelector('.panel-administracion');
    if (vacantesListado) {
        vacantesListado.addEventListener('click', accionesListado);
    }
});

const skills = new Set();

const agregarSkills = e => {
    if (e.target.tagName === 'LI') {
        if (e.target.classList.contains('activo')) {
            // Quitarlo del set y quitar la clase
            skills.delete(e.target.textContent);
            e.target.classList.remove('activo');
        } else {
            // Agregar al set y agregar la clase
            skills.add(e.target.textContent);
            e.target.classList.add('activo');
        }
    }
    const skillsArray = [...skills];
    document.querySelector('#skills').value = skillsArray;
};

const skillsSeleccionados = () => {
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));
    seleccionadas.forEach(seleccionada => {
        skills.add(seleccionada.textContent);
    });

    // Agregarlo al input hidden
    const skillsArray = [...skills];
    document.querySelector('#skills').value = skillsArray;
};

const limpiarAlertas = () => {
    const alertas = document.querySelector('.alertas');
    const interval = setInterval(() => {
        if (alertas.children.length > 0) {
            alertas.removeChild(alertas.children[0]);
        } else if (alertas.children.length === 0) {
            alertas.parentElement.removeChild(alertas);
            clearInterval(interval);
        }
    }, 2000);
};

// Eliminar vacantes
const accionesListado = e => {
    e.preventDefault();

    if (e.target.dataset.eliminar) {
        Swal.fire({
            title: 'Confirmar eliminación',
            text: 'Una vez eliminada, no se puede recuperar',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'No, cancelar'
        }).then(result => {
            if (result.isConfirmed) {
                // Enviar la petición con axios
                const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;

                axios.delete(url, { params: { url } })
                    .then(respuesta => {
                        if (respuesta.status === 200) {
                            Swal.fire('Eliminado', respuesta.data, 'success');

                            // Eliminar del DOM
                            e.target.closest('.vacante').remove();
                        }
                    })
                    .catch(() => {
                        Swal.fire('Hubo un error', 'No se pudo eliminar', 'error');
                    });
            }
        });
    } else if (e.target.tagName === 'A') {
        window.location.href = e.target.href;
    }
};
