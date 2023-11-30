import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface ICommunication {
  get(url: string, config?: any): Promise<any>;

  put(url: string, data: any, config?: any): Promise<any>;

  post(url: string, data: any, config?: any): Promise<any>;

  delete(url: string, config?: any): Promise<any>;
}

export class Http implements ICommunication {
  httpClient: AxiosInstance;

  constructor() {
    const axiosConfig = {
      // baseURL: 'https://c6eb-175-192-208-3.ngrok-free.app',
      baseURL: 'http://localhost:8081',
      withCredentials: true,
    };
    this.httpClient = axios.create(axiosConfig);
  }

  async get(url: string, config?: AxiosRequestConfig<any>) {
    return this.httpClient.get(url, {
      ...config,
    });
  }

  async post(url: string, data: any, config?: AxiosRequestConfig<any>) {
    return this.httpClient.post(url, data, {
      ...config,
    });
  }

  async put(url: string, data: any, config?: AxiosRequestConfig<any>) {
    return this.httpClient.put(url, data, {
      ...config,
    });
  }

  async delete(url: string, config?: AxiosRequestConfig<any>) {
    return this.httpClient.delete(url, {
      ...config,
    });
  }
}
