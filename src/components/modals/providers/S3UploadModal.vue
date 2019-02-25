<template>
  <modal-inner aria-label="Upload">
    <div class="modal__content">
      <div class="modal__image">
        
      </div>
    </div>
    <div class="modal__button-bar">
      <button class="button" @click="config.reject()">Cancel</button>
      <button class="button button--resolve" @click="resolve()">Ok</button>
    </div>
  </modal-inner>
</template>

<script>
import modalTemplate from '../common/modalTemplate';
import store from '../../../store';
import AWS from 'aws-sdk';

const albumBucketName = 'mms-myndir';
const bucketRegion = 'eu-west-1';
const IdentityPoolId = 'eu-west-1:93a07e1a-ecab-410e-bc39-fd655e2647c3';

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});

var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {Bucket: albumBucketName}
});

export default modalTemplate({
  data: () => ({
    
  }),
  created() {

  },
  methods: {
    resolve() {
      
    },
    listAlbums() {
      s3.listObjects({ Delimiter: '/' }, function(err, data) {
        if(err) {
          return console.error(err);
        } else {
          var albums = data.CommonPrefixes.map(function(commonPrefix) {
            var prefix = commonPrefix.Prefix;
            var albumName = decodeURIComponent(prefix.replace('/', ''));
            console.log(albumName);
          });
        }
      });
    },
  },
});
</script>
