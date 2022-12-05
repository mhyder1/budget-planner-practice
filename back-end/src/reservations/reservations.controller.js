
const reservationsService = require("./reservations.service.js");
const hasProperties = require("../errors/hasProperties");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

const hasRequiredProperties = hasProperties("first_name", "last_name", "mobile_number", "reservation_date", "reservation_time", "people");

const VALID_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
];

function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;

  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

function validDate(req, res, next) {
  const date = new Date(req.body.data.reservation_date.replace("-", "/"));
  // testing if date is a date
  if (!(date instanceof Date) || isNaN(date)) {
    return next({
      status: 400,
      message: `Invalid field(s): reservation_date`,
    });
  }
  // date is not in the past
  const today = new Date();
  // need to pass the "toDateString()" to a new date object to remove the time
  if (new Date(date.toDateString()) < new Date(today.toDateString())) {
    return next({
      status: 400,
      message: `Invalid field(s): reservation_date must be in the future`,
    });
  }
  // date is not a tuesday
  if (date.getDay() == 2) {
    return next({
      status: 400,
      message: `Invalid field(s): change reservation_date. restaurant is closed on tuesdays. `,
    });
  }
  return next();
}

function validTime(req, res, next) {
  const isValid = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/.test(req.body.data.reservation_time);
  // const timeFormat = /\d\d:\d\d/;
  if (isValid) {
    return next();
  }
  return next({
    status: 400,
    message: `Invalid field(s): reservation_time`,
  });
}


function hasPeople(req, res, next) {
  const people = Number(req.body.data.people)
  if (people >= 1) {
     return next()
  } else {
    return next({status: 400, message: `Invalid field(s): people`})
  }
}

function peopleNumber(req, res, next) {
  // checks the type of the data coming through, because we want a string version of a number to fail (ie, "2" should fail)
  if (typeof req.body.data.people !== "number") {
    return next({status: 400, message: `Invalid field(s): people amount must be a number.`})
  }
  return next();
}


async function create(req, res) {
  const newReservation = await reservationsService.create(req.body.data);
  res.status(201).json({
    data: newReservation,
  });
}

async function list(req, res) {
  const reservationDate = req.query.date;
  const data = await reservationsService.list(reservationDate);
  res.json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [hasOnlyValidProperties, hasRequiredProperties, hasPeople, peopleNumber, validDate, validTime, asyncErrorBoundary(create)],
};
