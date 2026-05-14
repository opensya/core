import { isValidObjectId, Types } from 'mongoose';

export function genObjectID(id: string) {
  isValidObjectId(id);

  // @ts-ignore
  const objectID = new Types.ObjectId(id);

  return objectID;
}
