/* global window */
const { spawn } = require('child_process');
const fs = require('fs');
const tmp = require('tmp');
const user = require('./user');
const path = require('path');
const filenamify = require('filenamify');
const slugify = require('slugify');
// Sanitize HTML is running with the default options
// https://www.npmjs.com/package/sanitize-html#what-are-the-default-options
const sanitizeHtml = require('sanitize-html');

let DEPLOY_URL = "/Users/halldor/Documents/mms/stackedit/lesari/static/content";

if (process.env.NODE_ENV === 'production') {
  DEPLOY_URL = "/var/www/lesari-web/content";
}

const readJson = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
};

exports.publishLesari = (req, res) => {
  return new Promise((resolve, reject) => {
    if(req.body.fileContent) {
      console.log(`Got file content of length ${req.body.fileContent.length}`);
      if(req.body.fileContent.length > 40000000) {
        reject("File is too big");
      }
    } else {
      reject("No file submitted");
    }
    if(!req.body.fileName) {
      reject("No filename submitted");
    }
    if(req.body.fileName.length > 60) {
      reject("Filename is too long");
    }

    let fileName = slugify(filenamify(req.body.fileName));
    fileName = fileName + ".html";
    fileName = fileName.toLowerCase();
    const filePath = path.join(DEPLOY_URL, fileName)

    fs.writeFile(filePath, sanitizeHtml(req.body.fileContent, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat( ['h1', 'h2', 'img'] ),
      allowedAttributes: {
        '*': [ 'id' ],
        a: [ 'href', 'name' ],
        img: [ 'src', 'alt' ],
        p: [ 'data-video' ],
      },
      allowedSchemes: [ 'https' ],

    }), function(err) {
      if(err) {
        return reject(err);
      }
      resolve(fileName);
    });   
  }).then((fileName) => {
    res.statusCode = 201;
    res.send(fileName);
    res.end();
  })
  .catch((err) => {
    const message = err && err.message;
    console.error(message);
    if (message === 'unauthorized') {
      res.statusCode = 401;
      res.end('Unauthorized.');
    } else if (message === 'timeout') {
      res.statusCode = 408;
      res.end('Request timeout.');
    } else {
      res.statusCode = 400;
      res.end('Unknown error.');
    }
  });
};
