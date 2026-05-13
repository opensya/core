// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { HydratedDocument } from 'mongoose';
import { ConfigSchema as _ConfigSchema } from '@opensya/share';
import { Schema } from 'mongoose';

// export type ConfigDocument = HydratedDocument<_ConfigSchema>;

// @Schema({ timestamps: true })
// export class Config implements _ConfigSchema {
//   @Prop({ type: String, required: true })
//   name!: string;

//   @Prop({ type: Object })
//   logo?: _ConfigSchema['logo'];

//   @Prop({ type: Object })
//   favicon?: _ConfigSchema['favicon'];

//   @Prop({ type: String })
//   primaryColor?: _ConfigSchema['primaryColor'];

//   @Prop({ type: String })
//   colorMode?: _ConfigSchema['colorMode'];
// }

// export const ConfigSchema = SchemaFactory.createForClass(Config);

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
