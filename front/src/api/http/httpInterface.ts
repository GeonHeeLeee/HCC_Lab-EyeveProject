import {ICommunication} from "./http";
import type {SignInData, SignUpData} from "./http.type";


export class HttpInterface {
  constructor(private apiClient: ICommunication) {
  }

  // TODO: Api 명세 대로 구현하기
  async signIn(data: SignInData) {
    return this.apiClient.post('/users/login', data);
  }

  async signUp(data: SignUpData) {
    return this.apiClient.post('/users', data);
  }


}