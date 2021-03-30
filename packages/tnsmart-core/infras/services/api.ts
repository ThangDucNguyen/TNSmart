import fetch from 'isomorphic-unfetch';
import moment from 'moment';
import { isObject, isEmpty } from 'lodash';
import { generateHmac } from '../../utils/hmac';
import { Config } from '../../core/models/Config';
import { getCurrentLangVar } from '../../utils/globalVariables';

class Api {
  _defaultOptions: any;
  _defaultHeaders: any;
  _defaultBaseUrl: any;

  constructor() {
    this._defaultBaseUrl = Config.apis.bluesky.endpoint;
    this._defaultOptions = {};
    this._defaultHeaders = {};
  }

  /**
   * Makes an HTTP request
   * @param {Object} params: {
   *                   baseUrl {String} (Optional) Specify baseURL for current request.
   *                   url {String} relative url.
   *                   method {String} HTTP method.
   *                   body {Object} Payload for POST/PUT/DELETE request.
   *                   token {String} Auth token.
   *                   responseType: json, text or arrayBuffer. Default is text
   *                 }
   * @return {Promise}
   */
  async send(
    { baseUrl, url, method = 'GET', headers = {}, token, body, responseType },
    context: any,
  ) {
    const locale = getCurrentLangVar();
    const _baseUrl = baseUrl || this._defaultBaseUrl;
    const defaultOptions = this._defaultOptions;
    const defaultHeaders = this._defaultHeaders;
    const path =
      '/' +
      url.replace(/^\//, '') +
      (url.indexOf('?') >= 0 ? '&' : '?') +
      `locale=${locale}`;
    const absUrl = _baseUrl.replace(/\/$/, '') + path;
    const opts = {
      ...defaultOptions,
      method,
      headers: {
        locale,
        Accept: 'application/json',
        tz: moment().format('Z'),
        ...defaultHeaders,
        ...headers,
        ...(await generateHmac(method, path)),
      },
    };

    let authedToken: string | null = null;
    if (token) {
      authedToken = token;
    } else if (context && context.Authorization) {
      authedToken = context.Authorization;
    } else if (Config.apis.bluesky.auth.token) {
      authedToken = `${Config.apis.bluesky.auth.token}`;
    }

    if (authedToken) opts.headers.Authorization = `${authedToken}`;

    if (body && method !== 'GET') {
      const isObject =
        Object.prototype.toString.call(body) === '[object Object]';
      if (isObject) {
        opts.body = JSON.stringify(body);
        if (opts.headers['Content-Type'] == null) {
          opts.headers['Content-Type'] = 'application/json';
        }
      } else {
        opts.body = body;
      }
    }

    let apiData: any;
    let startTime: number;
    if (process.env.NODE_ENV !== 'production') {
      apiData = {
        request: {
          url: absUrl,
          method: method,
          data: body,
          headers: opts.headers,
          params: {},
        },
      };
      startTime = new Date().getTime();
    }
    return fetch(absUrl, opts) // eslint-disable-line no-undef
      .then((response) => {
        if (process.env.NODE_ENV !== 'production') {
          apiData.response = {
            headers: response.headers,
            status: response.status,
          };
        }
        const method = getBodyFn(response, responseType);
        return response[method]().then((data) => {
          if (process.env.NODE_ENV !== 'production') {
            apiData.response.body = method === 'json' ? data : 'binary';
            apiData.duration = new Date().getTime() - startTime;
            const Reactotron = require('../../reactotron').default;
            Reactotron.apiResponse(
              apiData.request,
              apiData.response,
              apiData.duration,
            );
          }
          if (response.status >= 200 && response.status < 300) {
            return data;
          }
          if (data) {
            if (typeof data === 'object') {
              data.statusText = response.statusText;
            }
            throw data;
          }

          const error: any = new Error('Internal error');
          error.statusCode = response.status;
          throw error;
        });
      });
  }

  /**
   * Sets the base URL for subsequent API requests.
   * @param {String} url the base URL.
   */
  setDefaultBaseUrl(url) {
    url = url || '';
    this._defaultBaseUrl = url + (url.endsWith('/') ? '' : '/');
  }

  getDefaultBaseUrl() {
    return this._defaultBaseUrl;
  }

  getPhotoUrl(photoId) {
    return `${this._defaultBaseUrl}/photos/${photoId}/view`;
  }

  /**
   * Sets options for subsequent API requests.
   * @params {Object} options for API requests.
   */
  setOptions(options) {
    options = options || {};
    this._defaultOptions = { ...this._defaultOptions, ...options };
  }

  /**
   * Sets headers for subsequent API requests.
   * @params {Object} headers for API requests.
   */
  setHeaders(headers) {
    headers = headers || {};
    this._defaultHeaders = { ...this._defaultHeaders, ...headers };
  }

  /**
   * Performs a GET request.
   */
  get(params, context: any = {}) {
    const { qs, url: originalUrl = '' } = params;
    const isQueryExisted = originalUrl.indexOf('?') >= 0;
    const isValidQS = isObject(qs) && !isEmpty(qs);
    const url = `${originalUrl}${
      isValidQS ? `${isQueryExisted ? '&' : '?'}${encodeQuery(qs)}` : ''
      }`;

    return this.send({ ...params, url, method: 'GET' }, context);
  }

  /**
   * Performs a POST request.
   */
  post(params, context: any = {}) {
    return this.send({ ...params, method: 'POST' }, context);
  }

  /**
   * Performs a PUT request.
   */
  put(params, context: any = {}) {
    return this.send({ ...params, method: 'PUT' }, context);
  }

  /**
   * Performs a DELETE request.
   */
  delete(params, context: any = {}) {
    return this.send({ ...params, method: 'DELETE' }, context);
  }
}

async function parseResponse(response) { }

function getBodyFn(response, type = 'text') {
  const contentType = response.headers.get('Content-Type');
  return contentType && contentType.includes('json') ? 'json' : type;
}

function encodeQuery(qs) {
  if (!qs) return '';

  return Object.keys(qs)
    .filter((k) => qs[k])
    .map((k) => `${k}=${encodeURIComponent(qs[k])}`)
    .join('&');
}

export const api = new Api();
