export default defineMongoosePlugin((schema) => {
  schema.post(['find', 'findOne'], function (docs: any) {
    if (!docs) return;

    if (Array.isArray(docs)) {
      for (let i = 0; i < docs.length; i++) {
        const doc = docs[i];
        _.set(doc, 'id', doc.id.toString());
        docs[i] = doc;
      }
    } else _.set(docs, 'id', docs.id.toString());
  });
});
