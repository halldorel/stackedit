<template>
  <video
    ref="videoPlayer"
    :controls="true"
    :playsinline="true"
    ></video>
</template>
<script>

import Hls from "hls.js";

export default {
  name: 'video-preview',
  mounted() {
    if(Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(this.src);
      this.hls.attachMedia(this.$refs.videoPlayer);
    }

    this.$root.$on('play_video', (url) => {
      this.src = url;
    });
  },
  watch: {
    src: {
      handler(val) {
        this.hls.loadSource(val);
        this.hls.attachMedia(this.$refs.videoPlayer);
        this.$refs.videoPlayer.play();
      }
    }
  },
  data() {
    return {
      src: '',
      hls: undefined,
    };
  },
};
</script>

<style lang="scss">
  .drasl { display: block; }
</style>
