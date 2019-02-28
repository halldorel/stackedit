const AWS = require('aws-sdk');
const request = require('request');
const _ = require('lodash');
const config = require('../config');

AWS.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: 'eu-west-1',
});

const s3 = new AWS.S3();

const bucketVideos = 'menntamalastofnun-vod';
const bucketPictures = 'mms-myndir';

function listAssets(bucket) {
  return new Promise((resolve, reject) => {
    let responseData = [];
    s3.listObjects({Bucket: bucket}).on('success', function handlePage(response) {
      responseData.push(response.data["Contents"]);

      if (response.hasNextPage()) {
        response.nextPage().on('success', handlePage).send();
      } else {
        resolve(_.flatten(responseData));
      }
    }).on('error', function handleError(error) {
      reject(error);
    }).send();
  });
}

exports.listAssets = (req, res) => {
  listAssets(bucketVideos).then(assets => {
    res.send(_.map(assets, asset => {
      return _.pick(asset, ['Key', 'ETag']);
    }));
  }).catch(error => {
    console.error(error);
    res.send(error);
  });
}

exports.listPictures = (req, res) => {
  listAssets(bucketPictures).then(pictures => {
    res.send(_.map(pictures, picture => {
      return _.pick(picture, ['Key', 'ETag']);
    }));
  }).catch(error => {
    console.error(error);
    res.send(error);
  });
}

exports.uploadPictures = (req, res) => {
/* { fieldname: 'image',
       originalname: '34484449_10155653912391134_7547473384183955456_o.jpg',
       encoding: '7bit',
       mimetype: 'image/jpeg',
       buffer:
        <Buffer ff d8 ff e2 0b f8 49 43 43 5f 50 52 4f 46 49 4c 45 00 01 01 00 00 0b e8 00 00 00 00 02 00 00 00 6d 6e 74 72 52 47 42 20 58 59 5a 20 07 d9 00 03 00 1b ... >,
       size: 375921 }
       */

  // TODO: Resizing https://github.com/lovell/sharp

  const upload = (file, folderName) => new Promise((resolve, reject) => {
    var params = { Bucket: bucketPictures,
      Key: folderName + "/" + new Date().getTime() + "_" + file.originalname,
      Body: file.buffer }
    s3.upload(params, function(err, data) {
      if(err) {
        return reject(err);
      }
      resolve(data);
    });
  });

  Promise.all(req.files.map(upload)).then(uploadResultArray => {
    // const results = _.map(uploadResultArray, result => {
    //   return _.pick(result, )
    // });

    // TODO: HTTP stuff
    res.status(201).json({ uploadedFiles: uploadResultArray });
  }).catch(err => console.error(err));

  upload.then( data => console.log(data) )
  .catch( err => console.error(err) );
}