import { Model } from '@core/nest/types';
import { Types } from 'mongoose';

const model: Model = {
  schema: {
    close: { type: Boolean, required: true, default: false },
    userID: { type: Types.ObjectId, ref: 'User', index: true },
    serviceID: { type: String, index: true },
    refreshToken: { type: String, index: true, nullable: true },
  },
};

export default model;
