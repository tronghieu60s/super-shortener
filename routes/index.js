var express = require('express');
var router = express.Router();
var urlModel = require('../models/shortenlink');
var QRCode = require('qrcode');
var svgCaptcha = require('svg-captcha');


router.get('/', function (req, res) {
  var captcha = svgCaptcha.create({ background: "#36393f", noise: 1, width: 100 }); //https://www.npmjs.com/package/svg-captcha
  req.session.captcha = captcha.text;
  res.render('index', { url: '', qrcode: '', urldefault: '', captcha: captcha.data, err: '' });
});

router.get('/:link', function (req, res) {
  var link = req.params.link;
  urlModel.findOne({ shorten: link }, function (err, shortURL) {
    if (shortURL) {
      res.redirect(shortURL.url);
    } else {
      res.render('404');
    }
  })
});

router.get('/create/shorten', function (req, res) {
  if (isEmpty(req.query)) {
    res.render('404');
  } else {
    var shortPost = req.query;
    if (req.session.captcha != shortPost.type_captcha) {
      var captcha = svgCaptcha.create({ background: "#36393f", noise: 3, width: 100 }); //https://www.npmjs.com/package/svg-captcha
      req.session.captcha = captcha.text;
      res.render('index', { url: '', qrcode: '', urldefault: shortPost.url, captcha: captcha.data, err: 'Incorrect captcha code!' });
    } else {
      var shortenURL = controlShortenURL(shortPost.linkmode, shortPost.charlength);
      var dataURL = {
        url: shortPost.url,
        shorten: shortenURL
      }
      urlExist(shortenURL, shortPost.linkmode, shortPost.charlength, () => {
        QRCode.toDataURL(shortPost.url, function (err, qrcode) {
          urlModel.create(dataURL, function (err, small) {
            if (!err) {
              var captcha = svgCaptcha.create({ background: "#36393f", noise: 3, width: 100 }); //https://www.npmjs.com/package/svg-captcha
              req.session.captcha = captcha.text;
              res.render('index', { url: shortenURL, qrcode: qrcode, urldefault: shortPost.url, captcha: captcha.data, err: '' });
            }
          });
        })
      })
    }
  }
})

function controlShortenURL(linkMode, charLength) {
  if (linkMode == 1) {
    return randomCharZeroWidth(10);
  } else if (linkMode == 2) {
    return randomNumbers(charLength);
  } else {
    return randomChar(charLength);
  }
}

/* Check URL exist */
function urlExist(shortenURL, linkMode, charLength, cb) {
  urlModel.findOne({ shorten: shortenURL }, function (err, shortURL) {
    if (shortURL) {
      shortenURL = controlShortenURL(linkMode, charLength);
      urlExist(shortenURL, linkMode, charLength, cb);
    } else {
      cb();
    }
  })
}
/* Check Obj Empty */
function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
      return false;
  }
  return true;
}

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

module.exports = router;
