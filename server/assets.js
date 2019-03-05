const AWS = require('aws-sdk');
const request = require('request');
const _ = require('lodash');
const config = require('../config');
const sharp = require('sharp');
const filenamify = require('filenamify');
const slugify = require('slugify');

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
  // To keep it clean, do the same slugify / filenamify as in server/lesari.js
  const folderName = slugify(filenamify(req.body.fileName));

  const createSize = (file) => new Promise((resolve, reject) => {
    return sharp(file.buffer).resize(file.w, file.w, {
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    })
    .toFormat('jpeg')
    .toBuffer()
    .then(resizedBuffer => {
      console.log("resizedBuffer", resizedBuffer);
      file.resizedBuffer = resizedBuffer;
      resolve(file);
    });
  });

  const resize = (file) => {
    const outputSizes = [{ name: "large", w: 1200 },
    { name: "medium", w: 600 },
    { name: "small", w: 300 } ];
    const buffer = file.buffer;
    const originalName = file.originalname;

    return outputSizes.map(outputSize => {
      outputSize.buffer = buffer;
      outputSize.originalName = originalName;
      return outputSize;
    });
  };

  const upload = (file) => new Promise((resolve, reject) => {
    const fileName = folderName + "/" + file.name + "/" + new Date().getTime() + "_" + file.originalName;
    const params = {
      Bucket: bucketPictures,
      Key: fileName,
      Body: file.resizedBuffer, };
    return s3.upload(params, (err, data) => {
      if(err) {
        return reject(err);
      }
      resolve(data);
    });
  });



  Promise.all(req.files.map(resize)).then( files => {
    if(files.length === 0) {
      return res.status(401).json({ message: "No files to upload", })
    }
    const resizedFlat = _.flatten(files);
    return Promise.all(resizedFlat.map(createSize)).then( resizedFiles => {
      return Promise.all(resizedFlat.map(upload)).then( uploadResults => {
        console.log(uploadResults);
        res.status(201).json({ message: uploadResults });
      });
    });
  }).catch(err => res.status(500).json({ err: err }));
}