import { Config } from '../core/models/Config';

const hmacAsync = async (text, secret) => {
  const hmacSHA256 = require('crypto-js/hmac-sha256');
  const encBase64 = require('crypto-js/enc-base64');
  const encUtf8 = require('crypto-js/enc-utf8');
  const output = encBase64.stringify(hmacSHA256(encUtf8.parse(text), secret));
  return Promise.resolve(output);
};

export async function generateHmac(verb, path) {
  const date = new Date().toUTCString();
  const requestLine = `${verb} ${path} HTTP/1.1`;
  const stringToSign = `x-date: ${date}\n${requestLine}`;
  const encodedSignature = await hmacAsync(
    stringToSign,
    Config.apis.bluesky.hmac.secret,
  );
  const hmacAuth = `hmac username="${Config.apis.bluesky.hmac.username}",algorithm="hmac-sha256",headers="x-date request-line",signature="${encodedSignature}"`;
  return {
    'x-date': date,
    'bs-proxy-authorization': hmacAuth,
  };
}
