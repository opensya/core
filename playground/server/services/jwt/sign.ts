import { Env } from '@core/utils/env';
import jwt from 'jsonwebtoken';
import { JwtService } from '.';

const sign: JwtService['sign'] = function (payload, options) {
  const secretKey = Env.secret<string>('NEST_SECRET_KEY');
  return jwt.sign(payload, secretKey, {
    expiresIn: '7d',
    ...options,
  });
};

export default defineService(sign);
