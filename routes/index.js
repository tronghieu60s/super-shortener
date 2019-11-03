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

router.get('/rd/:link', function (req, res) {
  var link = req.params.link;
  urlModel.findOne({ shorten: link }, function (err, shortURL) {
    res.redirect(shortURL.url);
  })
});

router.get('/shorten', function (req, res) {
  var shortPost = req.query;
  if (req.session.captcha != shortPost.type_captcha) {
    var captcha = svgCaptcha.create({ background: "#36393f", noise: 3, width: 100 }); //https://www.npmjs.com/package/svg-captcha
    req.session.captcha = captcha.text;
    res.render('index', { url: '', qrcode: '', urldefault: shortPost.url, captcha: captcha.data, err: 'Incorrect captcha code!' });
  } else {
    var controlShortenURL = () => {
      if (shortPost.linkmode == 1) {
        return randomCharZeroWidth(shortPost.charlength);
      } else if (shortPost.linkmode == 2) {
        return randomNumbers(shortPost.charlength);
      } else {
        return randomChar(shortPost.charlength);
      }
    }
    var shortenURL = controlShortenURL();
    var dataURL = {
      url: shortPost.url,
      shorten: shortenURL
    }
    QRCode.toDataURL(shortPost.url, function (err, qrcode) {
      urlModel.create(dataURL, function (err, small) {
        if (!err) {
          var captcha = svgCaptcha.create({ background: "#36393f", noise: 3, width: 100 }); //https://www.npmjs.com/package/svg-captcha
          req.session.captcha = captcha.text;
          res.render('index', { url: shortenURL, qrcode: qrcode, urldefault: shortPost.url, captcha: captcha.data, err: '' });
        }
      });
    })
  }
})

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
