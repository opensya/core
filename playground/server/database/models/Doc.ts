import { Model } from '#core/nest//types';
import { DocSchema } from '@opensya/share';

const model: Model<DocSchema> = {
  schema: {
    filename: { type: String, required: true },
    type: { type: String, required: true },
    data: { type: Buffer, required: true },
    size: { type: Number, required: true },
  },
};

export default model;
