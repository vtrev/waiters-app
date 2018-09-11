module.exports = function (pool) {
    let getUserId = async function (username) {
        const sql = 'SELECT id FROM waiters WHERE name =$1';
        let result = await pool.query(sql, [username]);
        if (result.rowCount == 1) {
            let userId = result.rows[0].id;
            return userId
        } else {
            return '!user'
        }
    };


    let storeWaiterData = async function (data) {
        let waiterId = data.userId;
        let days = data.days;

        for (const day of days) {
            const sql = 'INSERT into shifts (waiter_id,weekday_id) values($1,$2)';
            const params = [waiterId, day];
            let result = await pool.query(sql, params);
        };
    };

    let getWaiterData = async function () {
        const sql = 'SELECT * FROM shifts';
        let result = await pool.query(sql);
        return result.rows;
    }
    let makeShifts = function (shiftData) {
        let shiftCount = {
            Monday: 0,
            Tuesday: 0,
            Wednesday: 0,
            Thursday: 0,
            Friday: 0,
            Saturday: 0,
            Sunday: 0
        }
        try {

            for (let i = 0; i < shiftData.length; i++) {
                let dayId = shiftData[i].weekday_id;
                if (dayId == 0) {
                    shiftCount.Monday++;
                } else
                if (dayId == 1) {
                    shiftCount.Tuesday++;
                } else if (dayId == 2) {
                    shiftCount.Wednesday++;
                } else if (dayId == 3) {
                    shiftCount.Thursday++;
                } else if (dayId == 4) {
                    shiftCount.Friday++
                } else if (dayId == 5) {
                    shiftCount.Saturday++
                } else if (dayId == 6) {
                    shiftCount.Sunday++
                }
            }
        } finally {
            return shiftCount
        }


    }

    let makeShiftStatus = function (shifts) {
        let shiftsWithStatus = {};
        try {
            for (const day in shifts) {
                if (shifts[day] < 3) {
                    shiftsWithStatus[day] = 'bad';
                }
                if (shifts[day] == 3) {
                    shiftsWithStatus[day] = 'ok';
                }
                if (shifts[day] > 3) {
                    shiftsWithStatus[day] = 'good'
                }
            }
        } finally {
            return shiftsWithStatus
        }
    }



    // factory returns
    return {
        getUserId,
        storeWaiterData,
        getWaiterData,
        makeShifts,
        makeShiftStatus
    }
}