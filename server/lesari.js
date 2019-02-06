/* global window */
const { spawn } = require('child_process');
const fs = require('fs');
const tmp = require('tmp');
const user = require('./user');
const path = require('path');
const filenamify = require('filenamify');

let DEPLOY_URL = "/Users/halldor/Documents/mms/stackedit/lesari/books";

if (process.env.NODE_ENV === 'production') {
  DEPLOY_URL = "/srv/taknmal.mms.is/vefir-sshfs";
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
    console.log(req.body);
    if(req.body.fileContent) {
      console.log(`Got file content of length ${req.body.fileContent.length}`);
    } else {
      reject("No file submitted");
    }
    if(!req.body.fileName) {
      reject("No filename submitted");
    }

    let fileName = filenamify(req.body.fileName);

    fs.writeFile(path.join(DEPLOY_URL, fileName), req.body.fileContent, function(err) {
      if(err) {
        reject(err);
      }
      resolve();
    });   
  }).then(() => {
    console.log("The file was saved!");
    res.statusCode = 201;
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