import { ConfigSchema as _ConfigSchema } from '@opensya/share';
import { Schema } from 'mongoose';

const model = {
  schema: new Schema<_ConfigSchema>(
    {
      name: { type: String, required: true },
      logo: { type: Object },
      favicon: { type: Object },
      primaryColor: { type: String },
      colorMode: { type: String },
    },

    { timestamps: true },
  ),
};

export default model;
