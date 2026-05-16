export default defineMongoosePlugin((schema) => {
  schema.set('toJSON', {
    depopulate: false,
    schemaFieldsOnly: false,

    transform(doc, ret) {
      _.set(ret, 'id', ret._id?.toString());
      _.unset(ret, '_id');
      _.unset(ret, '__v');
      _.unset(ret, 'password');

      for (const key in ret) {
        if (!Object.hasOwn(ret, key)) continue;

        const data: any = ret[key];
        if (data?.type !== 'Buffer') continue;

        _.unset(ret, key);
      }

      return ret;
    },
  });
});
