import { getConfigSchema } from '@opensya/share';

export default defineController(
  async ({ res, req, $t }) => {
    // const body = req.body;
    // const config = await models.Config.findOne();
    // const { schema } = getConfigSchema($t);
    // const data = await parseZod(schema, body);
    // await models.Config.updateOne({ _id: config?._id }, data);
    // const _config = await models.Config.findOne();
    // res.send(_config);
  },
  { public: true },
);
