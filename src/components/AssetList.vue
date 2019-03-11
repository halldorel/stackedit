<template>
  <div class="asset__list">
    <div class="asset__select">
      <select id="folders" v-model="selectedFolder">
        <option value="" disabled>Velja möppu</option>
        <option v-for="folder in assetFolders" :value="folder">{{ folder }}</option>
      </select>
    </div>
    <ul>
      <li v-for="item in filterByFolder(selectedFolder)">
        <span @click="(item) => playItem(item)" :data-key="item.Key">{{ item.fileName }}</span>
        <button class="asset__add" @click="(key) => { addReference( item ) }" v-title="'Add reference'">+</button>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import _ from 'lodash';
import axios from 'axios';
import editorSvc from '../services/editorSvc';

export default {
  name: 'asset-list',
  data: () => {
    return {
      selectedFolder: '',
    }
  },
  components: {

  },
  computed: {
    ...mapGetters('assets', ['assetList', 'assetFolders']),
  },
  methods: {
    addReference(assetReference) {
      editorSvc.pagedownEditor.uiManager.doAssetReference(this.convertAssetUrl(assetReference.Key));
    },
    convertAssetUrl(input) {
      const urlPrefix = 'https://d2gc4f1a062n80.cloudfront.net/';
      const escapedSpaces = input.split(' ').join('+');
      return urlPrefix + escapedSpaces;
    },
    playItem(event) {
      const url = this.convertAssetUrl(event.target.getAttribute('data-key'));
      this.$root.$emit('play_video', url);
    },
    folderSelected(event) {
      const folder = event.target.value;
    },
    filterByFolder(folder) {
      return this.assetList.filter(asset => asset.folderName === this.selectedFolder);
    },
    getAssets() {
      axios({ method: 'get', url: '/assets' })
      .then((result) => {
        const items = _.filter(_.map(result.data, (item) => {
          const itemNameParts = item.Key.split('/');
          item.fileName = _.last(itemNameParts);
          if(itemNameParts.length > 1) {
            item.folderName = itemNameParts[1];
          } else {
            item.folderName = "folder name missing";
          }
          return item;
        }), item => /^.*([^_360]|[^_540][^_720][^_1080]).m3u8$/.test(item.fileName));
        this.$store.commit('assets/setAssetList', _.sortBy(items, item => item.fileName));
      });
    },
  },
  mounted() {
    this.getAssets();
  },
};
</script>

<style lang="scss">
.asset__list {
  border-top: 1px solid #ccc;
  overflow-y: scroll;
  padding: 1em 0;
}

select {
  margin: 0 1em;
  width: calc(100% - 2em);
}

ul,
li {
  list-style: none;
  margin: 0;
  padding: 0 0.5em;
  font-size: 12px;
}

.asset__list ul li span {
  cursor: pointer;
}

li:nth-child(2n) {
  background: rgba(0, 0, 0, 0.05);
}

.asset__add {
  float: right;
  height: 1.5em;
  line-height: 1em;
  padding: 0 0.5em;
  border-radius: 0.5em;
  cursor: pointer;
  border: none;
  background: #fff;
}
</style>
