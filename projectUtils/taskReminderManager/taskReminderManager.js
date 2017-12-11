var later = require('later');

var taskReminderManager = function(){
    //TODO: finish implementing task reminder manager
    var taskReminders = [];

    this.loadPendingReminders = function(){
        // on server startup
        // go through the task reminders table and add to the task reminders array
        // that have the status of pending.
        // if there are any that have the reminder date previous to now
        // then, send an email saying, "sorry we missed your reminder"
    };
    this.scheduleReminder = function(taskReminderId){        
        var reminderDate;              
        // get task reminder recurrences from db by task reminder id
        var reminderOccurrences = [];
        for (var i = 0; i < reminderOccurrences; i++){

        }
        if (taskReminders[taskReminderId]){ return; } // if reminder is already scheduled, do nothing
        taskReminders[taskReminderId] = null; //set task reminder
            //send email reminder with link to task
    };

    this.cancelReminder = function(reminderId){
        taskReminders[reminderId].clear();
        delete taskReminders[reminderId];
    }
};

module.exports = taskReminderManager;