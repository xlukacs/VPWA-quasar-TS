import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { UserStateInterface } from './state';

const getters: GetterTree<UserStateInterface, StateInterface> = {
  getErrorMessage (context) {
    return context.errorMessage
  },
  getStatus (context) {
    return context.status
  }
};

export default getters;
