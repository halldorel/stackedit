<template>
  <modal-inner aria-label="Upload">
    <div class="modal__content">
      <div class="modal__status">{{ statusText }}</div>
      <form>
        <input type="file" id="file" ref="file" @change="handleFileUpload()" />
      </form>
    </div>
    <div class="modal__button-bar">
      <button class="button" @click="config.reject()">Cancel</button>
      <button class="button" @click="upload()">Upload</button>
    </div>
  </modal-inner>
</template>

<script>
import modalTemplate from '../common/modalTemplate';
import store from '../../../store';
import editorSvc from '../../../services/editorSvc';

export default modalTemplate({
  data: () => ({
    file: '',
    statusText: "Select a file",
  }),
  created() {

  },
  methods: {
    resolve() {

    },
    upload() {
      console.log("Upload", this.file);
      if(!this.file) {
        alert("Please select a file to upload");
        return;
      }
      this.statusText = "Uploading …";
      store.dispatch('assets/uploadImage', this.file).then((uploaded) => {
        if(uploaded.data.message.length > 0) {
          const cloudfrontUrl = 'https://' + 'd3mxr6ws60f763.cloudfront.net' + '/' + uploaded.data.message[0].key;

          editorSvc.pagedownEditor.uiManager.doUploadedImageUrl(cloudfrontUrl);
          this.statusText = "Upload completed!";
        } else {
          this.statusText = "There was an error uploading. Please try again.";
        }
      });
    },
    handleFileUpload(e) {
      this.file = this.$refs.file.files[0];
    },
  },
});
</script>

