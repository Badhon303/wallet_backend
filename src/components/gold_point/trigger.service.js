const moment = require('moment');
const schedule = require('node-schedule');
const httpStatus = require('http-status');

const { ethServices } = require('../eth');
const { dateConsts } = require('./date.consts');

const gpService = require('./goldPoint.service');

const GoldPoint = require('./goldPoint.model');
const GoldPointTrigger = require('./goldPoint.trigger.model');
const GPExecHistory = require('./goldPoint.triggerExecHistory.model');

const ApiError = require('../../utils/ApiError');

let job = null;

const pickNearestTrigger = async () => {
  const pendingTriggers = await GoldPointTrigger.find({ status: 'pending' }).exec();

  if (!pendingTriggers || pendingTriggers.length <= 0) {
    console.log(`pendingTriggers : ${pendingTriggers}`);
    return null;
  }

  pendingTriggers.sort((t1, t2) => {
    if (t1.year < t2.year) return -1;
    if (t1.year > t2.year) return 1;
    if (t1.month < t2.month) return -1;
    if (t1.month > t2.month) return 1;
    if (t1.day < t2.day) return -1;
    if (t1.day > t2.day) return 1;
    if (t1.hour < t2.hour) return -1;
    if (t1.hour > t2.hour) return 1;
    if (t1.minute < t2.minute) return -1;
    if (t1.minute > t2.minute) return 1;
  });

  console.log(pendingTriggers);
  const mostRecentTrigger = pendingTriggers[0];
  return mostRecentTrigger;
};

const getDateFromTrigger = async (trigger) => {
  return new Date(trigger.year, trigger.month - 1, trigger.day, trigger.hour, trigger.minute);
};

const cancelScheduledJob = async () => {
  if (job) {
    job.cancel();
  }
};

const getSelectedTokenBalanceForTrigger = async (address, token) => {
  const tokenType = 'erc20';
  const tokenBalance = await ethServices.getBalance(address, token, tokenType);
  return tokenBalance.result.balance;
};

const createGPExecHistory = async (
  user,
  trigger,
  goldPointBeforeTrigger,
  receivedGoldPointAmount,
  goldPointAfterTrigger
) => {
  await GPExecHistory.create({
    user,
    trigger,
    goldPointBeforeTrigger,
    receivedGoldPointAmount,
    goldPointAfterTrigger,
  });
};

const createAndUpdateGPforUser = async (user, goldPoint) => {
  await gpService.create(user);
  await GoldPoint.updateOne({ user }, { $set: { totalPoint: goldPoint } });
};

const updateTrigger = async (trigger, totalGP, numberOfUsers) => {
  trigger = await GoldPointTrigger.findByIdAndUpdate(
    { _id: trigger._id },
    { $set: { totalGP, numberOfUsers, status: 'success' } }
  );

  if (!trigger) {
    await GoldPointTrigger.findByIdAndUpdate({ _id: trigger._id }, { $set: { status: 'failed' } });
    throw new ApiError(httpStatus.BAD_REQUEST, 'Trigger event failed');
  }
};

const updateSchedule = async () => {
  console.log('Update Schedule called');

  const mostRecentTrigger = await pickNearestTrigger();
  await cancelScheduledJob();

  if (!mostRecentTrigger) {
    console.log(`most recent trigger : ${mostRecentTrigger}`);
    return;
  }

  const date = await getDateFromTrigger(mostRecentTrigger);
  const accounts = await ethServices.getAllAccount();

  job = schedule.scheduleJob(date, async () => {
    let totalGP = 0;
    let numberOfUsers = 0;
    const trigger = mostRecentTrigger;

    for (let i = 0; i < accounts.length; i += 1) {
      const tokenBalance = await getSelectedTokenBalanceForTrigger(accounts[i].address, trigger.token);

      let receivedGoldPointAmount = 0;
      let goldPointBeforeTrigger = 0;
      let goldPointAfterTrigger = 0;

      if (tokenBalance > 0) {
        receivedGoldPointAmount = tokenBalance * Number(mostRecentTrigger.gpPerToken);
        const gpObj = await GoldPoint.findOne({ user: accounts[i].user });

        if (!gpObj) {
          goldPointBeforeTrigger = 0;
          goldPointAfterTrigger = receivedGoldPointAmount;

          if (goldPointAfterTrigger < 0) {
            goldPointAfterTrigger = 0;
            receivedGoldPointAmount = Math.abs(goldPointBeforeTrigger + receivedGoldPointAmount) + receivedGoldPointAmount;
          }

          await createAndUpdateGPforUser(accounts[i].user, goldPointAfterTrigger);
        } else {
          goldPointBeforeTrigger = gpObj.totalPoint;
          goldPointAfterTrigger = goldPointBeforeTrigger + receivedGoldPointAmount;

          if (goldPointAfterTrigger < 0) {
            goldPointAfterTrigger = 0;
            receivedGoldPointAmount = Math.abs(goldPointBeforeTrigger + receivedGoldPointAmount) + receivedGoldPointAmount;
          }

          gpObj.totalPoint = goldPointAfterTrigger;
          await gpObj.save();
        }

        await createGPExecHistory(
          accounts[i].user,
          trigger._id,
          goldPointBeforeTrigger,
          receivedGoldPointAmount,
          goldPointAfterTrigger
        );

        totalGP += receivedGoldPointAmount;
        numberOfUsers += 1;
      }
    }

    await updateTrigger(trigger, totalGP, numberOfUsers);
    updateSchedule();
  });
  console.log('Update Schedule executed successfully');
};

const isFutureDate = async (scheduledDate, currentDate) => {
  const currentDateMonth = currentDate.getMonth() + 1;

  if (scheduledDate.year > currentDate.getFullYear()) {
    return true;
  }

  if (scheduledDate.year === currentDate.getFullYear() && scheduledDate.month > currentDateMonth) {
    return true;
  }

  if (
    scheduledDate.year === currentDate.getFullYear() &&
    scheduledDate.month === currentDateMonth &&
    scheduledDate.day > currentDate.getDate()
  ) {
    return true;
  }

  if (
    scheduledDate.year === currentDate.getFullYear() &&
    scheduledDate.month === currentDateMonth &&
    scheduledDate.day === currentDate.getDate() &&
    scheduledDate.hour > currentDate.getHours()
  ) {
    return true;
  }

  if (
    scheduledDate.year === currentDate.getFullYear() &&
    scheduledDate.month === currentDateMonth &&
    scheduledDate.day === currentDate.getDate() &&
    scheduledDate.hour === currentDate.getHours() &&
    scheduledDate.minute > currentDate.getMinutes()
  ) {
    return true;
  }

  return false;
};

const getMillis = async (scheduledDate) => {
  const date = new Date(
    scheduledDate.year,
    scheduledDate.month - 1,
    scheduledDate.day,
    scheduledDate.hour,
    scheduledDate.minute
  );
  return moment(date, 'D,M,YYYY H:mm').valueOf();
};

const findTriggerWithinTwentyFourHours = async (formatedTime) => {
  const pendingTriggers = await GoldPointTrigger.find({ status: 'pending' }).exec();
  let doesExistsWithinTwentyFourHours = false;
  const triggerMillis = await getMillis(formatedTime);

  for (let index = 0; index < pendingTriggers.length; index += 1) {
    const existingTriggerMillis = await getMillis(pendingTriggers[index]);
    if (Math.abs(triggerMillis - existingTriggerMillis) <= dateConsts.millisInTwentyFourHours) {
      doesExistsWithinTwentyFourHours = true;
      break;
    }
  }
  return doesExistsWithinTwentyFourHours;
};

const formatDate = async (scheduleDate) => {
  const formatedTime = {};
  const arrDateTime = scheduleDate.split(' ');
  const dateArr = arrDateTime[0].split('/');
  const timeArr = arrDateTime[1].split(':');

  formatedTime.day = Number(dateArr[0]);
  formatedTime.month = Number(dateArr[1]);
  formatedTime.year = Number(dateArr[2]);
  formatedTime.hour = Number(timeArr[0]);
  formatedTime.minute = Number(timeArr[1]);

  const currentDate = new Date();

  if (formatedTime.minute > dateConsts.maxMinuteValue || formatedTime.minute < dateConsts.minMinuteValue) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Provided minute must be in between ${dateConsts.minMinuteValue} - ${dateConsts.maxMinuteValue}`
    );
  }

  if (formatedTime.hour > dateConsts.maxHourValue || formatedTime.hour < dateConsts.minHourValue) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Provided hour must be in between ${dateConsts.minHourValue} - ${dateConsts.maxHourValue}`
    );
  }

  if (formatedTime.month > dateConsts.maxMonthValue || formatedTime.month < dateConsts.minMonthValue) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Provided month must be in between ${dateConsts.minMonthValue} - ${dateConsts.maxMonthValue}`
    );
  }

  if (formatedTime.month === 2) {
    const maxDaysInFebruary =
      (formatedTime.year % 4 == 0 && formatedTime.year % 100 != 0) || formatedTime.year % 400 == 0 ? 29 : 28;

    if (formatedTime.day > maxDaysInFebruary || formatedTime.day < dateConsts.minDayValue) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Provided date must be in between ${dateConsts.minDayValue} - ${maxDaysInFebruary}`
      );
    }
  }

  if (formatedTime.day > dateConsts.daysOfMonth[formatedTime.month] || formatedTime.day < dateConsts.minDayValue) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Provided date must be in between ${dateConsts.minDayValue} - ${dateConsts.daysOfMonth[formatedTime.month]}`
    );
  }

  const isValidDate = await isFutureDate(formatedTime, currentDate);
  if (!isValidDate) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `Provided Date-time must be a future time.`);
  }

  const isAnyScheduleWithinTwentyFourHours = await findTriggerWithinTwentyFourHours(formatedTime);
  if (isAnyScheduleWithinTwentyFourHours) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `Time difference within two triggers must at least 24 hours`);
  }

  return formatedTime;
};

const createTrigger = async (token, scheduleDate, goldPoint) => {
  const formattedDateTime = await formatDate(scheduleDate);
  const gpTrigger = new GoldPointTrigger({
    token,
    gpPerToken: goldPoint,
    minute: formattedDateTime.minute,
    hour: formattedDateTime.hour,
    day: formattedDateTime.day,
    month: formattedDateTime.month,
    year: formattedDateTime.year,
  });

  const response = await gpTrigger.save();
  updateSchedule();
  return response;
};

const deleteTriggerById = async (triggerId) => {
  const scheduledTrigger = await GoldPointTrigger.findById(triggerId);

  if (!scheduledTrigger) {
    throw new ApiError(httpStatus.NOT_FOUND, `Trigger does not exists.`);
  }

  const canBeDeleted = scheduledTrigger.status === 'pending';

  if (!canBeDeleted) {
    throw new ApiError(httpStatus.METHOD_NOT_ALLOWED, `Trigger cannot be deleted because it has already been executed.`);
  }

  const response = await GoldPointTrigger.findByIdAndDelete(triggerId);
  updateSchedule();

  return { message: `Trigger deleted successfully`, result: response };
};

const deleteTriggerByIdBasedOnDate = async (triggerId) => {
  const date = new Date();
  const scheduledTrigger = await GoldPointTrigger.findById(triggerId);

  if (!scheduledTrigger) {
    throw new ApiError(httpStatus.NOT_FOUND, `Trigger does not exists.`);
  }

  const canBeDeleted = isFutureDate(scheduledTrigger, date);
  console.log(canBeDeleted);

  if (!canBeDeleted) {
    throw new ApiError(
      httpStatus.METHOD_NOT_ALLOWED,
      `Trigger cannot be deleted because it was scheduled in past and might be executed`
    );
  }

  const response = await GoldPointTrigger.findByIdAndDelete(triggerId);
  updateSchedule();
  console.log(`Exited from updateschedule`);

  return { message: `Trigger deleted successfully`, result: response };
};

module.exports = { createTrigger, deleteTriggerById, deleteTriggerByIdBasedOnDate };
