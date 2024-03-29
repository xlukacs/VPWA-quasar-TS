import { GetterTree } from 'vuex'
import { StateInterface } from '../index'
import { AuthStateInterface } from './state'

const getters: GetterTree<AuthStateInterface, StateInterface> = {
  isAuthenticated (context) {
    return context.user !== null
  },
  getUserName(context){
    return context.user?.username;
  },
  getUserPic(context){
    return context.user?.picName;
  },
  getOwnId(context){
    return context.user?.id;
  }
}

export default getters
