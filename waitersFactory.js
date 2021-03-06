module.exports = function (pool) {

    let createUser = async function (username) {
        const sql = 'INSERT INTO waiters (name) values($1) returning id';
        const params = [username];
        let result = await pool.query(sql, params);
        return result.rows[0].id
    };
    let getUserId = async function (username) {
        const sql = 'SELECT id FROM waiters WHERE name =$1';
        let result = await pool.query(sql, [username]);
        if (result.rowCount == 1) {
            let userId = result.rows[0].id;
            return userId
        } else {
            let newUserId = await createUser(username);
            return newUserId
        };
    };
    let storeWaiterData = async function (data) {
        let waiterId = data.userId;
        let days = data.days;
        for (const day of days) {
            const sql = 'INSERT into shifts (waiter_id,weekday_id) values($1,$2) returning waiter_id,weekday_id';
            const params = [waiterId, day];
            await pool.query(sql, params);
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
        };
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
        };
    };
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
                };
            };
        } finally {
            return shiftsWithStatus
        };
    };
    let getWaiterShifts = async function (userId) {
        let dayStatus = weekdays();
        const sql = 'SELECT weekday_id FROM shifts where waiter_id =$1';
        const params = [userId];
        let result = await pool.query(sql, params);
        let dayIds = result.rows;
        let dayKeys = Object.keys(dayStatus);
        // now try
        try {
            for (let i = 0; i < dayKeys.length; i++) {
                for (let j = 0; j < dayIds.length; j++) {
                    if (i == dayIds[j].weekday_id) {
                        let day = dayKeys[i];
                        dayStatus[day] = 'checked';
                    };
                };
            };
        } finally {
            return dayStatus
        };
    };
    let clear = async function (username) {
        let userId = await getUserId(username);
        if (username == 'everything') {
            await pool.query('DELETE from shifts');
            return 'Database has been cleared successfully'
        } else {
            const sql = 'DELETE FROM shifts WHERE waiter_id=$1';
            const params = [userId];
            await pool.query(sql, params);
            return 'Records successfuly cleared for ' + username
        };
    };
    let getAdminShifts = async function () {
        let updatedShifts = weekdays();
        const sql = "select weekday,name from weekdays  join shifts on shifts.weekday_id=weekdays.id join waiters on waiters.id=shifts.waiter_id";
        let result = await pool.query(sql);
        let shifts = result.rows;
        let dayObject = weekdays();
        let dayKeys = Object.keys(dayObject);
        let days = [
            dayKeys[0], dayKeys[1], dayKeys[2], dayKeys[3], dayKeys[4], dayKeys[5], dayKeys[6]
        ];
        try {
            for (let i = 0; i < shifts.length; i++) {
                for (let j = 0; j < days.length; j++) {
                    if (shifts[i].weekday == days[j]) {
                        updatedShifts[days[j]] = updatedShifts[days[j]] + shifts[i].name + ',';
                    };
                };
            };
        } finally {
            for (day in updatedShifts) {
                let weekdayString = updatedShifts[day];
                let spitDays = weekdayString.split(',');
                // remove the last element of list which is an empty space
                spitDays.pop();
                let fixedDays = spitDays.join();
                updatedShifts[day] = fixedDays
            }
            return updatedShifts
        };
    };
    let weekdays = function () {
        let days = {
            Monday: '',
            Tuesday: '',
            Wednesday: '',
            Thursday: '',
            Friday: '',
            Saturday: '',
            Sunday: ''
        }
        return days
    }
    // factory returns
    return {
        getUserId,
        storeWaiterData,
        getWaiterData,
        makeShifts,
        makeShiftStatus,
        getWaiterShifts,
        clear,
        getAdminShifts,
        createUser
    };
};