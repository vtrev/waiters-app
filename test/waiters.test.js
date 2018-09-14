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
        await pool.query('DELETE from waiters');
    });
    // Testing for method that creates a user
    it('Should create a user and add them into the database', async function () {
        let result = await waitersInstance.createUser('Vusi');
        let query = await pool.query("SELECT * FROM waiters WHERE name='Vusi'");
        assert.equal(query.rowCount, 1);
    });
    //Testing for correct userId

    it('Should return  the correct waiter id', async function () {
        let Mpume = await waitersInstance.createUser('Mpume');
        assert.equal(Mpume, await waitersInstance.getUserId('Mpume'));
    });
    it('StoreWaiterData should store the days the waiter has checked && then be able to get them back using getWaiterShifts method ', async function () {

        let jimmyId = await waitersInstance.createUser('Jimmy');
        let userDataSample = {
            userId: jimmyId,
            days: [0, 4, 5]
        };
        let shifts = {
            Monday: 'checked',
            Tuesday: '',
            Wednesday: '',
            Thursday: '',
            Friday: 'checked',
            Saturday: 'checked',
            Sunday: ''
        };
        await waitersInstance.storeWaiterData(userDataSample);
        // getWaiterShifts should be able  to retrieve the stored days
        let result = await waitersInstance.getWaiterShifts(jimmyId);
        assert.deepEqual(result, shifts);
    });




    it('Should return information on waiters that have added their data on the app', async function () {
        await waitersInstance.createUser('Vusi');
        await waitersInstance.createUser('Thabang');
        await waitersInstance.createUser('Mike');

        async function getId(user) {

            let id = await waitersInstance.getUserId(user);
            return id
        }
        let userDataSample0 = {
            userId: await getId('Mike'),
            days: [6, 4, 3]
        }
        let userDataSample1 = {
            userId: await getId('Thabang'),
            days: [0, 4, 3]
        }
        let userDataSample2 = {
            userId: await getId('Vusi'),
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