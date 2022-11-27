export interface UserStateInterface {
  errorMessage: string,
  status: string
}

function state(): UserStateInterface {
  return {
    errorMessage: '',
    status: 'online'
  };
}

export default state;
