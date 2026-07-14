export default defineRouteHandler(
  async (request) => {
    if (!request.actor) return {};

    const user = await database.engine.findOne("users", {
      where: {
        conditions: [
          { field: "id", operator: "eq", value: request.actor.userId },
        ],
      },
    });

    if (!user) return {};

    return {
      user,
      orgRole: request.actor?.orgRole,
      teamRoles: request.actor?.teamRoles,
    };
  },

  { config: { publicRoute: true } },
);
