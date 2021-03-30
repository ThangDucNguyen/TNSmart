import moment from 'moment';
import { AxiosRequestConfig, ResponseType } from 'axios';
import { keysToCamel } from '../../utils';
import { Config } from '../../core';
import { getCurrentLangVar } from '../../utils/globalVariables';

const axios = require('axios').default;

export class HttpService {
  protected forceMappingDataKeyToCamel: boolean = false;

  constructor(
    private context: string = '',
    private endpoint: string = Config.apis.bluesky.endpoint,
  ) {}

  public async request(config: AxiosRequestConfig) {
    let apiData: any = {};
    let startTime: number = 0;
    const locale = getCurrentLangVar();
    if (!config.params) {
      config.params = { locale };
    } else if (!config.params.locale) {
      config.params.locale = locale;
    }
    if (!config.headers) {
      config.headers = {
        locale: locale,
        tz: moment().format('Z'),
      };
    } else if (!config.headers.locale) {
      config.headers.locale = locale;
      config.headers.tz = moment().format('Z');
    }
    if (!config.headers.Authorization) {
      config.headers.Authorization = `${Config.apis.bluesky.auth.token}`;
    }
    try {
      if (process.env.NODE_ENV !== 'production') {
        apiData = {
          request: {
            url: config.url,
            method: config.method,
            data: config.data,
            headers: config.headers,
            params: config.params,
          },
        };
        startTime = new Date().getTime();
      }
      const res = await axios(config);

      if (
        this.forceMappingDataKeyToCamel &&
        res.data &&
        config.responseType !== 'arraybuffer'
      ) {
        res.data = keysToCamel(res.data);
      }

      if (process.env.NODE_ENV !== 'production') {
        apiData.response = {
          headers: res.headers,
          body: res.data,
          status: res.status,
        };
      }

      if (config.responseType && config.responseType === 'arraybuffer') {
        return res.data;
      }

      return res.data.data;
    } catch (ex) {
      // console.log(ex.response && ex.response.data);
      if (ex.response) {
        if (process.env.NODE_ENV !== 'production') {
          apiData.response = {
            headers: ex.response.headers,
            body: ex.response.data,
            status: ex.response.status,
          };
        }
        if (ex.response.data) {
          if (typeof ex.response.data === 'object') {
            throw {
              ...ex.response.data,
              status: ex.response.data.status || ex.response.data.name,
            };
          }

          const error: any = new Error(
            ex.response.data.message || ex.response.data,
          );
          error.statusCode = ex.status;
          throw error;
        }
      }
      throw ex;
    } finally {
      if (process.env.NODE_ENV !== 'production') {
        apiData.duration = new Date().getTime() - startTime;
        const Reactotron = require('../../reactotron').default;
        Reactotron.apiResponse(
          apiData.request,
          apiData.response,
          apiData.duration,
        );
      }
    }
  }

  postForm(
    path: string,
    formData: FormData,
    headers: object = {},
    responseType?: ResponseType,
  ) {
    return this.request({
      method: 'post',
      url: `${this.endpoint}${this.context}/${path}`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...headers,
      },
      responseType,
    });
  }

  post(
    path: string,
    data: object,
    headers: object = {},
    responseType?: ResponseType,
  ) {
    return this.request({
      method: 'post',
      url: `${this.endpoint}${this.context}/${path}`,
      data: data,
      headers,
      responseType,
    });
  }

  put(path: string, data: object, headers: object = {}) {
    return this.request({
      method: 'put',
      url: `${this.endpoint}${this.context}/${path}`,
      data: data,
      headers,
    });
  }

  del(path: string, data: object, headers: object = {}) {
    return this.request({
      method: 'delete',
      url: `${this.endpoint}${this.context}/${path}`,
      data: data,
      headers,
    });
  }

  get(path: string, headers: object = {}, responseType?: ResponseType) {
    return this.request({
      method: 'get',
      url: `${this.endpoint}${this.context}/${path}`,
      headers,
      responseType,
    });
  }
}
