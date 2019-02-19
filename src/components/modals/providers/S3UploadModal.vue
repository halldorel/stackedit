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

export default modalTemplate({
  data: () => ({
    
  }),
  created() {
    console.log("Here");
  },
  methods: {
    resolve() {
      
    },
  },
});
</script>
