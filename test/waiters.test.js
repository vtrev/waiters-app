'use strict'

const assert = require('assert');
const Waiters = require('../waitersFactory');
const pg = require("pg");
const Pool = pg.Pool;


const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:pass@127.0.0.1:5432/waiters';

const pool = new Pool({
    connectionString
});

const waitersInstance = Waiters(pool);

describe('Waiters web app', function () {
    beforeEach(async function () {
        await pool.query('DELETE from shifts');
    });

    // Testing method bla bla bla
    // it('Should set name of the user in an object', function () {
    //     waitersInstance.setUser('Vusi');
    //     assert.equal(waitersInstance.dataFromUser.name, 'Vusi');
    // });
    // it('Should set the days a user wants to work', function () {
    //     waitersInstance.setDays([0, 3, 4, 5]);
    //     assert.deepEqual(waitersInstance.dataFromUser.days, [0, 3, 4, 5]);
    // });
    it('Should return  the correct waiter id', async function () {
        let result = await waitersInstance.getUserId('Jim');
        assert.equal(result, 1);
    });
    // Two units (store and retrieve)are being tested at the same time to avoid repeating code
    it('Should store the waiter\'s data into the database && retrieve it', async function () {
        let userDataSample = {
            userId: 2,
            days: [0, 4]
        }

        await waitersInstance.storeWaiterData(userDataSample);
        let result = await waitersInstance.getWaiterData();
        assert.deepEqual([{
            waiter_id: 2,
            weekday_id: 0
        }, {
            waiter_id: 2,
            weekday_id: 4
        }, ], result);
    });

    it('Should return information on waiters that have added their data on the app', async function () {
        let userDataSample0 = {
            userId: 4,
            days: [6, 4, 3]
        }
        let userDataSample1 = {
            userId: 1,
            days: [0, 4, 3]
        }
        let userDataSample2 = {
            userId: 3,
            days: [0, 4, 5]
        }
        let result = {
            Monday: 2,
            Tuesday: 0,
            Wednesday: 0,
            Thursday: 2,
            Friday: 3,
            Saturday: 1,
            Sunday: 1
        }

        await waitersInstance.storeWaiterData(userDataSample0);
        await waitersInstance.storeWaiterData(userDataSample1);
        await waitersInstance.storeWaiterData(userDataSample2);
        let data = await waitersInstance.getWaiterData();
        let query = await waitersInstance.makeShifts(data);

        assert.deepEqual(result, query)
    });
    it('Should return the correct status of everyday of the week ok if 3 waiters,bad if less than 3 and good when over 3 waiters are available', function () {
        let shifts = {
            Monday: 0,
            Tuesday: 6,
            Wednesday: 3,
            Thursday: 4,
            Friday: 1,
            Saturday: 12,
            Sunday: 13
        };
        let expectedResult = {
            Monday: 'bad',
            Tuesday: 'good',
            Wednesday: 'ok',
            Thursday: 'good',
            Friday: 'bad',
            Saturday: 'good',
            Sunday: 'good'
        };
        assert.deepEqual(waitersInstance.makeShiftStatus(shifts), expectedResult);
    });



});