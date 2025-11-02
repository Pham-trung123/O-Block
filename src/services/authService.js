import {postData} from './api.js';
export const authService={
  async login(data){return await postData('/api/login',data)},
  async register(data){return await postData('/api/register',data)}
};
