const cron = require('node-cron');
const { mlmService } = require('../components/mlm');
const { goldPointService } = require('../components/gold_point');

//  ┌───────────── minute (0 - 59)
//  │ ┌───────────── hour (0 - 23)
//  │ │ ┌───────────── day of month (1 - 31)
//  │ │ │ ┌───────────── month (1 - 12)
//  │ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday;
//  │ │ │ │ │                                       7 is also Sunday on some systems)
//  │ │ │ │ │
//  │ │ │ │ │
//  * * * * *  command_to_execute

const updateGoldPointDillarPrice = () => {
  cron.schedule(
    '0 0 * * *',
    function () {
      goldPointService.updateGPDollarPrice();
    },
    {
      scheduled: true,
      timezone: 'Atlantic/Azores',
    }
  );
};

const handleMlmRequests = () => {
  cron.schedule('0 0 * * *', function () {
    mlmService.executeMlmRequests();
  });
};

const initiate = () => {
  updateGoldPointDillarPrice();
  handleMlmRequests();
};

module.exports = { initiate };
