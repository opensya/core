import { Model } from '@core/nest/types';

const model = {
  schema: {
    close: { type: Boolean, required: true, default: false },
    serviceID: { type: String, index: true },
  },
} satisfies Model;

export default model;
