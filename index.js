'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const PORT = process.env.PORT || 3030;
const session = require('express-session');
const flash = require('express-flash');
const WaitersFactory = require('./waitersFactory');
const router = require('./routes');

// DB Setup
const {
    Pool
} = require('pg');
// Heroku pool
let useSSL = false;
let local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local) {
    useSSL = true;
}
// which db connection to use
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:pass@127.0.0.1:5432/waiters';

const pool = new Pool({
    connectionString,
    ssl: useSSL
});
const waitersInstance = WaitersFactory(pool);
const route = router(waitersInstance);


// app use
app.use(session({
    secret: 'Tshimugaramafatha'
}));
app.use(flash());
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
}));
app.set('view engine', 'handlebars');
app.use('/', express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// Routes
app.get('/', function (req, res) {
    res.render('home');
});
app.get('/waiters/:username', route.getWaiters);
app.post('/waiters/:username', route.postWaiters);
app.get('/admin', route.getAdmin);
app.post('/admin', route.postAdmin);

//FIRE TO THE SERVER  
app.listen(PORT, function () {
    console.log('Waiters app running on port : ', PORT)
});