import { MutationTree } from 'vuex';
import { UserStateInterface } from './state';

const mutation: MutationTree<UserStateInterface> = {
  SET_ERROR (state, message: string) {
    state.errorMessage = message
  },
  CLEAR_ERROR(state){
    state.errorMessage = ''
  },
  SET_STATUS(state, status: string){
    state.status = status
  }
};

export default mutation;
