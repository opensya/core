import { Model } from '@core/nest/types';
import { Types } from 'mongoose';

const model = {
  schema: {
    close: { type: Boolean, required: true, default: false },
    userID: { type: Types.ObjectId, ref: 'User', index: true },
    serviceID: { type: String, index: true },
    refreshToken: { type: String, index: true, nullable: true },
  },
} satisfies Model;

export default model;
