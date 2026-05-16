import jwt from 'jsonwebtoken';
import { JwtService } from '.';

const decode: JwtService['decode'] = function (token, options) {
  return jwt.decode(token, options) as any;
};

export default defineService(decode);
