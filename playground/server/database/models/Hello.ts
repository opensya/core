import { Schema } from 'mongoose';

const model = {
  schema: new Schema(
    {
      close: { type: Boolean, required: true, default: false },
      serviceID: { type: String, index: true },
    },

    { timestamps: true },
  ),
};

model.schema.set('toJSON', {
  transform: (_doc, ret) => {
    (ret as any).id = ret._id.toString();
  },
});

export default model;
