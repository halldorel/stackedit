const AWS = require('aws-sdk');
const request = require('request');
const _ = require('lodash');
const config = require('../config');
const sharp = require('sharp');
const filenamify = require('filenamify');

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
  const folderName = filenamify(req.body.folderName);

  const createSize = (file) => new Promise((resolve, reject) => {
    // Returns a promise
    console.log("Inside resize", file);
    sharp(file.buffer).resize(file.w, file.w, {
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    })
    .toFormat('jpeg')
    .toBuffer()
    .then(resizedBuffer => {
      console.log("resizedBuffer", resizedBuffer);
      file.resizedBuffer = resizedBuffer;
      resolve(file);
    })
    .catch(err => { console.error(err); reject(err); });
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

    //Promise.all(files).then(resized => resolve(resized)).catch(err => reject(err));
  };

  const upload = (file) => new Promise((resolve, reject) => {
    const fileName = folderName + "/" + file.name + "/" + new Date().getTime() + "_" + file.originalName;
    const params = {
      Bucket: bucketPictures,
      Key: fileName,
      Body: file.resizedBuffer, };

    console.log("file: ", file);
    console.log("params: ", params);

    return s3.upload(params, (err, data) => {
      if(err) {
        console.error(err);
        return reject(err);
      }
      resolve(data);
    });
  });

  Promise.all(req.files.map(resize)).then( files => {
    const resizedFlat = _.flatten(files);
    Promise.all(resizedFlat.map(createSize)).then( resizedFiles => {
      console.log(resizedFiles);
      Promise.all(resizedFlat.map(upload)).then( uploadResults => {
        res.status(201).json({ message: uploadResults });
      }).catch(err => res.status(500).json({ err: err }));
    }).catch(err => res.status(500).json({ err: err }));
  }).catch(err => res.status(500).json({ err: err }));

  // Promise.all(req.files.map(resizeAndUpload)).then(uploadResultArray => {
  //   res.status(201).json({ uploadedFiles: uploadResultArray });
  // }).catch(err => res.status(500).json({ error: "Upload failed" }));
}