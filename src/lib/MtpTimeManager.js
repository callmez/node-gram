const {
  longFromInts,
  nextRandomInt,
} = require('./bin_utils')
const {
  dT,
  tsNow,
} = require('./utils')
const Storage = require('./Storage')

// .factory('MtpTimeManager', function (Storage) {
  var lastMessageID = [0, 0]
  var timeOffset = 0

  Storage.get('server_time_offset').then(function (to) {
    if (to) {
      timeOffset = to
    }
  })

  function generateMessageID () {
    var timeTicks = tsNow(),
      timeSec = Math.floor(timeTicks / 1000) + timeOffset,
      timeMSec = timeTicks % 1000,
      random = nextRandomInt(0xFFFF)

    var messageID = [timeSec, (timeMSec << 21) | (random << 3) | 4]
    if (lastMessageID[0] > messageID[0] ||
      lastMessageID[0] == messageID[0] && lastMessageID[1] >= messageID[1]) {
      messageID = [lastMessageID[0], lastMessageID[1] + 4]
    }

    lastMessageID = messageID

    // console.log('generated msg id', messageID, timeOffset)

    return longFromInts(messageID[0], messageID[1])
  }

  function applyServerTime (serverTime, localTime) {
    var newTimeOffset = serverTime - Math.floor((localTime || tsNow()) / 1000)
    var changed = Math.abs(timeOffset - newTimeOffset) > 10
    Storage.set({server_time_offset: newTimeOffset})

    lastMessageID = [0, 0]
    timeOffset = newTimeOffset
    console.log(dT(), 'Apply server time', serverTime, localTime, newTimeOffset, changed)

    return changed
  }

  // return {
  module.exports = {
    generateID: generateMessageID,
    applyServerTime: applyServerTime
  }
// })
