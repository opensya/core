declare module '@core/nest/types/controllers' {
  interface ControllerOptions2 {
    public?: boolean;
  }
}

export default defineGuard(({ controllerOptions, request }) => {
  if (controllerOptions.public) return;

  if (!request._session) {
    return { pass: false, errorMessage: 'session.errors.not_authorized' };
  }
});
