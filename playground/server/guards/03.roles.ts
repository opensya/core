declare module '@core/nest/types/controllers.js' {
  interface ControllerOptions2 {
    roles?: string[]; // TODO JobUser['role'][];
  }
}

export default defineGuard(({ controllerOptions, request }) => {
  if (!controllerOptions.roles) return;

  if (!controllerOptions.roles.includes(request._user?.role)) {
    return { pass: false, errorMessage: $t('session.errors.not_authorized') };
  }
});
