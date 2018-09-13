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

// Routes
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
})

app.get('/waiters/:username', async function (req, res) {
    let username = req.params.username;
    let userId = await waitersInstance.getUserId(username);
    let userShifts = await waitersInstance.getWaiterShifts(userId);
    res.render('home', {
        welcomeMessage: 'Hello ' + username + '! When would you like to work?',
        days: userShifts
    });
});

app.post('/waiters/:username', async function (req, res) {
    let dataFromUser = {};
    dataFromUser.days = req.body.weekdays;
    let username = req.params.username;
    await waitersInstance.clear(username);
    let userId = await waitersInstance.getUserId(username);
    dataFromUser.userId = userId;
    await waitersInstance.storeWaiterData(dataFromUser);
    let userShifts = await waitersInstance.getWaiterShifts(userId);
    req.flash('info', 'Thanks ' + username + ' your preferred working days have been captured.');
    res.render('home', {
        days: userShifts
    });
});
app.get('/admin', async function (req, res) {
    let namedShifts = await waitersInstance.getAdminShifts();
    let waiterData = await waitersInstance.getWaiterData();
    let shifts = await waitersInstance.makeShifts(waiterData);
    let shiftStatus = await waitersInstance.makeShiftStatus(shifts);
    res.render('admin', {
        status: shiftStatus,
        count: shifts,
        updatedShifts: namedShifts
    });
});
app.post('/admin', async function (req, res) {

    let message = await waitersInstance.clear('everything');
    req.flash('info', message);
    let waiterData = await waitersInstance.getWaiterData();
    let shifts = await waitersInstance.makeShifts(waiterData);
    let shiftStatus = await waitersInstance.makeShiftStatus(shifts);
    res.render('admin', {
        status: shiftStatus,
        count: shifts
    });
});

//FIRE TO THE SERVER  
app.listen(PORT, function () {
    console.log('Waiters app running on port : ', PORT)
});