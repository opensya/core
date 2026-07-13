export default defineRouteHandler(
  async (request) => {
    if (!request.user) return {};

    const auth = await database.engine.findOne("auths", {
      where: {
        conditions: [{ field: "id", operator: "eq", value: request.user.sub }],
      },
      populate: ["user"],
    });

    if (!auth) return {};

    return {
      user: (auth as any).user,
    };
  },

  // { publicRoute: true },
);
