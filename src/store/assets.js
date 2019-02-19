import moduleTemplate from './moduleTemplate';
import empty from '../data/empties/emptyFile';
import _ from 'lodash';

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
    state.assetFolders = _.map(state.assetList, asset => asset);
    console.log(state.assetFolders);
  },
};

module.actions = {
  ...module.actions,
};

export default module;