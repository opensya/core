import { genObjectID } from '#core/nest//utils/database';

export default defineMongoosePlugin((schema) => {
  function toArray(param?: string | string[]) {
    if (!param) return [];
    if (!Array.isArray(param)) return [param];
    return param;
  }

  function toObject(param?: string | string[]) {
    const params = toArray(param);
    const obj: { [key: string]: string | null } = {};

    params.forEach((param) => {
      const [path, localField] = param.split('->');
      _.set(obj, path, localField || null);
    });

    return obj;
  }

  schema.pre(['find', 'findOne'], function () {
    const populates = toObject(this.getOptions().usePopulate);

    for (const path in populates) {
      if (!Object.hasOwn(populates, path)) continue;
      this.populate(path);
    }
  });

  schema.post(['find', 'findOne'], function (docs: any) {
    const populatedPaths = this.getPopulatedPaths();
    const populates = toObject(this.getOptions().usePopulate);

    if (Array.isArray(docs)) {
      for (let idx = 0; idx < docs.length; idx++) {
        docs[idx] = transform(docs[idx]);
      }
    } else docs = transform(docs);

    function transform(doc: any) {
      for (const path in populates) {
        if (!Object.hasOwn(populates, path)) continue;

        const localField = populates[path];
        if (!localField) continue;
        if (!populatedPaths.includes(path)) return;

        const popDoc = _.get(doc, path);
        _.set(doc, path, genObjectID(popDoc._id));
        _.set(doc, localField, popDoc);
      }

      return doc;
    }
  });
});
