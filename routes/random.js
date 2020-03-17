/* Random Character, Number and Zero Width */
function randomChar(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function randomNumbers(num) {
    var result = '';
    for (let i = 0; i < num; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
}

function randomCharZeroWidth(num) {
    var zeroWidth = ['\u200c', '\u200d'];
    var result = '';
    for (let i = 1; i <= num; i++) {
        result += zeroWidth[Math.floor(Math.random() * zeroWidth.length)];
    }
    return result;
}

module.exports = { randomChar, randomNumbers, randomCharZeroWidth }