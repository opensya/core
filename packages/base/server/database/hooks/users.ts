export default defineDatabaseHooks(({ hooks }) => {
  hooks.onBeforeCreate("users", (data) => ({
    ...data,
    email:
      typeof data.email === "string"
        ? data.email.trim().toLowerCase()
        : data.email,
  }));

  hooks.onAfterCreate("users", async (user, context) => {
    console.log("User created:", user.id);
    console.log("Request:", context.requestId);
  });
});
