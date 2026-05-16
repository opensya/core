import { Readable } from 'node:stream';

export default defineController(
  async ({ req, res }) => {
    const model = getModel('Doc');
    const doc = await model.findById(req.params.id);

    res.setHeader('Content-Type', doc.type);
    res.setHeader('Content-Length', doc.size);

    const stream = Readable.from(doc.data);
    stream.pipe(res);
  },
  { public: true },
);
