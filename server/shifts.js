const moment = require ('moment');
const shifts = {
    shift1: {
        checkIn: ['06:00', '09:00'],
        checkOut: ['16:00', '18:00'],
    },
    shift2: {
<<<<<<< HEAD
        checkIn: ['08:00', '16:00'],
=======
        checkIn: ['10:00', '16:00'],
>>>>>>> e2e4f4c2ef475ed569e984b630ae0131d5ca9bfe
        checkOut: ['23:00', '01:00'],
    },
    shift3: {
        checkIn: ['23:00', '01:00'],
        checkOut: ['16:00', '18:00'],
    },
    shift4: {
        checkIn: ['07:00', '09:00'],
        checkOut: ['16:00', '18:00'],
    },
};

function getStatus(theshift) {
    const currentTime = moment().format('HH:mm');
    const [checkInStart, checkInEnd] = theshift.checkIn;
    const [checkOutStart, checkOutEnd] = theshift.checkOut;
    if (currentTime >= checkInStart && currentTime <= checkInEnd) {
      return 'Check in';
    } else if (currentTime >= checkOutStart && currentTime <= checkOutEnd) {
      return 'Check out';
    } else {
      return 'Unknown';
    }
  }


module.exports = {shifts, getStatus};