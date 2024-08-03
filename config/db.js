const mongoose = require('mongoose');
require('dotenv').config({ path: 'variables.env' });

mongoose.connect(process.env.DATABASE, {
  serverSelectionTimeoutMS: 30000, // Aumenta el tiempo de espera a 30 segundos
  ssl: true // Asegúrate de que SSL esté habilitado
});

mongoose.connection.on('error', (error) => {
    console.error('Error de conexión:', error);
});

mongoose.connection.once('open', () => {
    console.log('Conectado a MongoDB');
});

// Importar los modelos
require('../models/Vacantes');
require('../models/Usuarios');
