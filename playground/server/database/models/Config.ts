import { Model } from '#core/nest/types';
import { ConfigSchema as _ConfigSchema } from '@opensya/share';

const model: Model<_ConfigSchema> = {
  schema: {
    name: { type: String, required: true },
    logo: { type: Object },
    favicon: { type: Object },
    primaryColor: { type: String },
    colorMode: { type: String },
  },
};

export default model;
