'use strict';

class Example {

  // This is required. This is the schedule for which the task will run.
  // More docs here: https://github.com/node-schedule/node-schedule#cron-style-scheduling
  static get schedule() {
    // once every minute
    return '30 * * * *';
  }

  // This is the function that is called at the defined schedule
  * handle() {
    // Do stuff here
    // Supports `yield`
    console.log('The answer to life, the universe, and everything!');
  }

}

module.exports = Example;