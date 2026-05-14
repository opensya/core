import jwt from 'jsonwebtoken';

export type JwtService = {
  sign(payload: string | Buffer | object, options?: jwt.SignOptions): string;

  verify<TPayload = jwt.JwtPayload>(
    token: string,
    options?: jwt.VerifyOptions,
  ): TPayload;

  decode<TPayload = null | string | jwt.JwtPayload>(
    token: string,
    options?: jwt.DecodeOptions,
  ): TPayload;
};
