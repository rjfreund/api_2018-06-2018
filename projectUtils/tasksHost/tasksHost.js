var tasksHost = '';
var isLocalMobile = true;
if (process.env.NODE_ENV === 'production'){ tasksHost = 'http://tasks.rjfreund.com'; }
else if (isLocalMobile){ tasksHost = '10.0.2.2:8080'; }
else { tasksHost = 'http://localhost:8080'; }
module.exports = tasksHost;