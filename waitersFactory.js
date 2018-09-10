module.exports = function (pool) {
    let dataFromUser = {};
    let waiterData = {};

    let setUser = function (username) {
        dataFromUser.name = username;
    };

    let setDays = function (days) {
        dataFromUser.days = days;
    };

    let getUserId = function (username) {
        const sql = 'SELECT id FROM waiters WHERE name =$1';
        let result = pool.query(sql, [username]);
        console.log(result);
    };

    let storeWaiterData = async function (data) {
        let waiterId = data.userId; // 
        let days = data.days; // 

        for (const day of days) {
            const sql = 'INSERT into shifts (waiter_id,weekdai_id)';
            const params = [waiterId, day];
            let result = await pool.query(sql, params);
            console.log(result);
        };
    };

    let getWaiterData = async function () {
        const sql = 'SELECT * FROM shifts';
        let result = pool.query(sql);
    }



    // factory returns
    return {
        waiterData,
        setUser,
        setDays
    }
}