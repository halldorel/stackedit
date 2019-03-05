import axios from 'axios';
import _ from 'lodash';

import moduleTemplate from './moduleTemplate';
import empty from '../data/empties/emptyFile';
import store from '../store';

const module = moduleTemplate(empty);

module.state = {
  ...module.state,
  assetList: [],
  assetFolders: [],
};

module.getters = {
  ...module.getters,
  assetList: state => state.assetList,
  assetFolders: state => state.assetFolders,
};

module.mutations = {
  ...module.mutations,
  setAssetList(state, value) {
    state.assetList = value;
    state.assetFolders = _.union(_.map(state.assetList,
    	asset => asset.folderName));
  },
};

module.actions = {
  ...module.actions,
  uploadImage(state, imageFile) {
    const currentFile = store.getters['file/current'];
    let formData = new FormData();
    formData.set('fileName', currentFile.name);
    formData.append('image', imageFile);

    return axios({
      method: 'POST',
      url: '/pictures',
      data: formData,
      config: {
        headers: {'Content-Type': 'application/x-www-form-urlencoded',
        'mimeType': 'multipart/form-data' },
      },
    }).catch((error) => {
      console.error(error);
    });
  },
};

export default module;