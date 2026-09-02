import { Model } from "mongoose";

function formatCurrentDate(day: string, month: string, year: string) {
  if (month.length === 1) {
    month = "0" + month;
  }
  if (day.length === 1) {
    day = "0" + day;
  }
  let currentDate = `${year}${month}${day}`;
  return currentDate;
}

function getCurrentDate() {
  const date = new Date();

  let day = `${date.getDate()}`;
  let month = `${date.getMonth() + 1}`;
  let year = `${date.getFullYear()}`;

  let currentDate = Number(formatCurrentDate(day, month, year));
  return currentDate;
}

function formatIncomingDate(date: any) {
  date = Number(date.replace(/-/g, ""));
  return date;
}

function checkIfInPast(data: any) {
  let eventDate = formatIncomingDate(data.Date);
  let currentDate = getCurrentDate();
  return eventDate < currentDate;
}

async function deleteExpired(data: any, Event: Model<any>) {
  const surviving = [];
  for (let i = 0; i < data.length; i++) {
    if (checkIfInPast(data[i])) {
      // is in the past therefore we will delete
      let id = JSON.stringify(data[i]._id);
      id = JSON.parse(id);
      await Event.findByIdAndDelete({ _id: id });
    } else {
      // is in the future therefore keep.
      surviving.push(data[i]);
    }
  }
  return surviving;
}

const actions = {
  deleteExpired,
  checkIfInPast,
};

export default actions;
