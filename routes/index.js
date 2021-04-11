const express = require("express");
const router = express.Router();
const urlModel = require("../models/shortenlink");
const QRCode = require("qrcode");
const svgCaptcha = require("svg-captcha");

const { isEmpty, controlShortenURL } = require("./support");

router.get("/", function (req, res) {
  const captcha = svgCaptcha.create({
    background: "#36393f",
    noise: 1,
    width: 100,
  }); //https://www.npmjs.com/package/svg-captcha
  req.session.captcha = captcha.text;

  const renderData = {
    url: "",
    qrcode: "",
    urldefault: "",
    captcha: captcha.data,
    err: "",
  };
  res.render("index", renderData);
});

router.get("/:link", function (req, res) {
  var { link } = req.params;
  urlModel.findOne({ shorten: link }, function (err, shortURL) {
    if (shortURL) {
      res.redirect(shortURL.url);
    } else {
      res.render("404");
    }
  });
});

router.get("/create/shorten", function (req, res) {
  if (isEmpty(req.query)) {
    res.render("404");
    return;
  }
  
  const shortPost = req.query;
  if (req.session.captcha != shortPost.type_captcha) {
    var captcha = svgCaptcha.create({
      background: "#36393f",
      noise: 3,
      width: 100,
    }); //https://www.npmjs.com/package/svg-captcha
    req.session.captcha = captcha.text;

    const renderData = {
      url: "",
      qrcode: "",
      urldefault: shortPost.url,
      captcha: captcha.data,
      err: "Incorrect captcha code!",
    };
    res.render("index", renderData);
    return;
  }

  const shortenURL = controlShortenURL(
    shortPost.linkmode,
    shortPost.charlength
  );
  const dataURL = {
    url: shortPost.url,
    shorten: shortenURL,
  };
  urlExist(shortenURL, shortPost.linkmode, shortPost.charlength, () => {
    QRCode.toDataURL(shortPost.url, function (err, qrcode) {
      urlModel.create(dataURL, function (err, small) {
        if (!err) {
          var captcha = svgCaptcha.create({
            background: "#36393f",
            noise: 3,
            width: 100,
          }); //https://www.npmjs.com/package/svg-captcha
          req.session.captcha = captcha.text;
          res.render("index", {
            url: shortenURL,
            qrcode: qrcode,
            urldefault: shortPost.url,
            captcha: captcha.data,
            err: "",
          });
        }
      });
    });
  });
});

/* Check URL exist */
function urlExist(shortenURL, linkMode, charLength, cb) {
  urlModel.findOne({ shorten: shortenURL }, function (err, shortURL) {
    if (shortURL) {
      shortenURL = controlShortenURL(linkMode, charLength);
      urlExist(shortenURL, linkMode, charLength, cb);
    } else {
      cb();
    }
  });
}

module.exports = router;
