import { Config } from '../core/models/Config';

const bcrypt = require('bcryptjs');

export const getPasswordHash = (password: string): Promise<string> => {
  return bcrypt.hashSync(password, Config.apis.bluesky.auth.passwordSalt);
};
