import { ICommunication } from './http';
import type { SignInData, SignInRes, SignUpData } from './http.type';
// import { Response } from 'http-proxy-middleware/dist/types';

export class HttpInterface {
  constructor(private apiClient: ICommunication) {}

  // TODO: Api 명세 대로 구현하기
  async checkAuthentication() {
    return this.apiClient.get('/auto-login');
  }

  async signIn(data: SignInData) {
    return this.apiClient.post('/users/login', data);
  }

  async signUp(data: SignUpData) {
    return this.apiClient.post('/users', data);
  }

  async signOut() {
    return this.apiClient.post('/users/logout', undefined);
  }
}
