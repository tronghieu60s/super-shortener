const random = require('./random');

/* Check Obj Empty */
function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function controlShortenURL(linkMode, charLength) {
    if (linkMode == 1) {
      return random.randomCharZeroWidth(10);
    } else if (linkMode == 2) {
      return random.randomNumbers(charLength);
    } else {
      return random.randomChar(charLength);
    }
  }

module.exports = { isEmpty, controlShortenURL }