import store from '../../store';
import Provider from './common/Provider';
import config from '../../config';

export default new Provider({
  id: 'lesari',
  name: 'Lesari',
  getPath() {
    return config.dev.env.DEPLOY_URL;
  },
  publish(token, html, metadata, publishLocation) {
    const post = 
    return {
      ...publishLocation
    };
  },
});
