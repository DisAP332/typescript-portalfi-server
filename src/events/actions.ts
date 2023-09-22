import Event from "./eventsModel";

let Events: any = [];

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
  if (eventDate < currentDate) {
    // is in the past therefore we will delete
    return true;
  } else {
    // is in the future therefore push to events.
    Events.push(data);
    return false;
  }
}

async function deleteExpired(data: any) {
  Events = [];
  for (let i = 0; i < data.length; i++) {
    if (checkIfInPast(data[i]) === true) {
      let id = JSON.stringify(data[i]._id);
      id = JSON.parse(id);
      await Event.findByIdAndDelete({ _id: id });
    }
  }
  return Events;
}

const actions = {
  deleteExpired,
  checkIfInPast,
};

export default actions;
