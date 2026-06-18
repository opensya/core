export type MaybeArray<T> = T | T[];

export type Nullable<T> = T | null;

export type Undefinedable<T> = T | undefined;

export type MayBePromise<T> = Promise<T> | T;

export type Join<T, K> = T & K;

export type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  | Function;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredKey<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;
