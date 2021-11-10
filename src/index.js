const { path, express, passport,
     flash, Handlebars, bodyParser,
     session, exphbs, methodOverride,
     allowInsecurePrototypeAccess } = require('./config/dependencies');


const socketHelper = require('./helpers/socketHelper');
const receivers = require('./helpers/serverIo');

// Servidor de Express

const app = express();
const { PORT } = require('./config/properties');
app.set('port', PORT);
app.set('views', path.join(__dirname, 'views'));

// Middlewares del Servidor

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
     secret: 'Xeyrfjl1234@fd',
     resave: true,
     saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Extensiones

require('./config/database');
require('./config/passport');
require('./helpers/jobs');

// Configuracion de Express Handlebars

app.engine('.hbs', exphbs({
     handlebars: allowInsecurePrototypeAccess(Handlebars),
     defaultLayout: 'main',
     layoutsDir: path.join(app.get('views'), 'layouts'),
     partialsDir: path.join(app.get('views'), 'partials'),
     extname: '.hbs',
     helpers: {
          if_equal: function (a, b, opts) {
               if (a == b) {
                    return opts.fn(this)
               } else {
                    return opts.inverse(this)
               }
          },
          if_not_equal: function (a, b, opts) {
               if (a != b) {
                    return opts.fn(this)
               } else {
                    return opts.inverse(this)
               }
          },
          isdefined: function(value) {
               return value !== undefined;
          }
     }
}));
app.set('view engine', '.hbs');

// Variables Globales

app.use((req, res, next) => {
     res.locals.success_msg = req.flash('success_msg');
     res.locals.error_msg = req.flash('error_msg');
     res.locals.error = req.flash('error');
     res.locals.user = req.user || null;
     next();
});

// Archivos de Rutas

app.use(require('./routes/root'));
app.use(require('./routes/inicio'));
app.use(require('./routes/peticion'));
app.use(require('./routes/respuesta'));
app.use(require('./routes/bandeja'));
app.use(require('./routes/usuario'));

// Inicializacion del Servidor

const server = app.listen(app.get('port'), () => {
     const io = require('socket.io')(server);
     socketHelper.set(io);
     receivers.receivers(io);
     console.log('Server on port', app.get('port'));
});