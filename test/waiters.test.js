'use strict'

const assert = require('assert');
const Waiters = require('../waitersFactory');
const pg = require("pg");
const Pool = pg.Pool;


const connectionString = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/waiters';

const pool = new Pool({
    connectionString
});

const waitersInstance = Waiters(pool);

describe('Registrations web app', function () {
    beforeEach(async function () {
        // await pool.query('DELETE from waiters');
    });

    // Testing method bla bla bla
    it('Should do something', async function () {

    });


});