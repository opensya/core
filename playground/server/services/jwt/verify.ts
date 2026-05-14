import { Env } from '@core/utils/env';
import jwt from 'jsonwebtoken';
import { JwtService } from '.';

const verify: JwtService['verify'] = function (token, options) {
  const secretKey = Env.secret<string>('NEST_SECRET_KEY');
  return jwt.verify(token, secretKey, options) as any;
};

export default defineService(verify);
