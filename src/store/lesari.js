import axios from 'axios';
import moduleTemplate from './moduleTemplate';
import empty from '../data/empties/emptyFile';
import exportSvc from '../services/exportSvc.js';
import store from '../store';

const module = moduleTemplate(empty);

module.state = {
  ...module.state,
};

module.getters = {
  ...module.getters,
};

module.mutations = {
  ...module.mutations,
};

module.actions = {
  ...module.actions,
  publish() {
  	const currentFile = store.getters['file/current'];
  	const template = {
    value: '{{{files.0.content.html}}}',
    helpers: '',};
  	console.log(currentFile);
  	exportSvc.applyTemplate(currentFile.id, template).then((html) => {
	  return axios.post('/publishLesari', {
	    	fileName: currentFile.name, 
	    	fileContent: html,
	    }).then((response) => {
	    	console.log(response);
	    }).catch((error) => {
	    	console.error(error);
	    });
  	});
  },
};

export default module;
