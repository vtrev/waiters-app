module.exports = function (waitersInstance) {
    // get routes
    let getWaiters = async function (req, res) {
        let username = req.params.username;
        let userId = await waitersInstance.getUserId(username);
        let userShifts = await waitersInstance.getWaiterShifts(userId);
        res.render('home', {
            welcomeMessage: 'Hi ' + username + '! When would you like to work?',
            days: userShifts,
            css: {
                welcome: 'welcome'
            }
        });
    }
    let getAdmin = async function (req, res) {
        let namedShifts = await waitersInstance.getAdminShifts();
        let waiterData = await waitersInstance.getWaiterData();
        let shifts = await waitersInstance.makeShifts(waiterData);
        let shiftStatus = await waitersInstance.makeShiftStatus(shifts);
        res.render('admin', {
            status: shiftStatus,
            count: shifts,
            updatedShifts: namedShifts
        });
    }


    // post routes
    let postWaiters = async function (req, res) {
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
            days: userShifts,
            css: {
                flash: 'flashgood'
            }
        });
    }

    let postAdmin = async function (req, res) {

        let message = await waitersInstance.clear('everything');
        req.flash('info', message);
        let waiterData = await waitersInstance.getWaiterData();
        let shifts = await waitersInstance.makeShifts(waiterData);
        let shiftStatus = await waitersInstance.makeShiftStatus(shifts);
        res.render('admin', {
            status: shiftStatus,
            count: shifts
        });
    }

    return {
        getWaiters,
        getAdmin,
        postWaiters,
        postAdmin
    }

}