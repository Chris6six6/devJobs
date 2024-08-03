const mongoose = require('mongoose');
require('./config/db'); // Configuración de la base de datos

const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const router = require('./routes');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const createError = require('http-errors');
const passport = require('./config/passport');

require('dotenv').config({ path: 'variables.env' });

const app = express();

// Habilitar body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar Handlebars
const hbs = exphbs.create({
    defaultLayout: 'layout',
    helpers: require('./helpers/handlebars'),
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
});

// Configurar el directorio de vistas
app.set('views', path.join(__dirname, 'views'));

// Habilitar Handlebars como view engine
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

// Configurar sesión
app.use(session({
    secret: process.env.SECRETO,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DATABASE,
        mongooseConnection: mongoose.connection
    })
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use(flash());

// Middleware para mensajes
app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    next();
});

// Rutas
app.use('/', router());

// 404 Página no encontrada
app.use((req, res, next) => {
    next(createError(404, 'No encontrado'));
});

// Manejo de errores
app.use((error, req, res, next) => {
    res.locals.mensaje = error.message;
    res.render('error'); // Asegúrate de que la vista 'error' exista en 'views'
});

// Definir el puerto y arrancar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`El servidor está funcionando en el puerto: ${port}`);
});
