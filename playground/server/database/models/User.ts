import { Model } from '@core/nest/types';
import { normalize } from '@core/nest/utils/normalize';
import { UserSchema, USER_ROLES } from '@opensya/share';
import { Query } from 'mongoose';

function buildNormalizedFullname(data: {
  firstName?: string;
  lastName?: string;
  email?: string;
}) {
  return normalize(
    [data.firstName, data.lastName, data.email].filter((v) => v).join(' '),
  );
}

async function normalizeUserUpdate(this: Query<any, any>) {
  const update = this.getUpdate() as any;

  const data = update?.$set ?? update;
  if (!data) return;

  const current = await this.model.findOne(this.getQuery());
  if (!current) return;

  if (data.email) {
    data.email = data.email.toLowerCase().trim();
  }

  const payload = {
    firstName: data.firstName ?? current.firstName,
    lastName: data.lastName ?? current.lastName,
    email: data.email ?? current.email,
  };

  data.normalizedFullname = buildNormalizedFullname(payload);

  if (update?.$set) {
    update.$set = data;
    this.setUpdate(update);
  } else {
    this.setUpdate(data);
  }
}

const model: Model<
  UserSchema & { password?: string; normalizedFullname?: string }
> = {
  schema: {
    email: { type: String, required: true },
    firstName: { type: String, required: true, minlength: 1 },
    lastName: { type: String, required: true, minlength: 1 },
    password: { type: String, select: false },
    avatar: { type: Object },
    role: { type: String, enum: USER_ROLES, default: 'recruiter' },
    active: { type: Boolean, default: true },
    normalizedFullname: { type: String, required: true, index: true },
  },

  factory(schema) {
    schema.index(
      { normalizedFullname: 'text' },
      { weights: { normalizedFullname: 5 } },
    );

    schema.pre('validate', function () {
      if (this.email) this.email = this.email.toLowerCase().trim();
      this.normalizedFullname = buildNormalizedFullname(this);
    });

    schema.pre('updateOne', normalizeUserUpdate);

    schema.pre('findOneAndUpdate', normalizeUserUpdate);
  },
};

export default model;
