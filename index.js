const mongoose = require('mongoose');
require('./config/db.js');

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

// Validacion de campos
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar Handlebars para permitir el acceso a propiedades del prototipo
const hbs = exphbs.create({
    defaultLayout: 'layout',
    helpers: require('./helpers/handlebars'),
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
});

// Habilitar Handlebars como view engine
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRETO,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DATABASE,
        mongooseConnection: mongoose.connection
    })
}));

// Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

// Alertas y flash messages
app.use(flash());

// Crear nuestro middleware
app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    next();
});

app.use('/', router());

// 404 Pagina no encontrada
app.use((req, res, next) => {
    next(createError(404, 'No encontado'));
})

// Administracion de los errores
app.use((error, req, res, next) => {
    res.locals.mensaje = error.message;

    res.render('error');
})

app.listen(process.env.PUERTO, () => {
    console.log(`Servidor escuchando en el puerto ${process.env.PUERTO}`);
});
