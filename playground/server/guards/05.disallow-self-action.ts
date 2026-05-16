import { MayBePromise } from '@opensya/share';
import { Request } from 'express';

declare module '@core/nest/types/controllers' {
  interface ControllerOptions2 {
    disallowSelfAction?:
      | true
      | string
      | ((req: Request) => MayBePromise<string>);
  }
}

export default defineGuard(async ({ controllerOptions, request }) => {
  if (!controllerOptions.disallowSelfAction) return;

  let userID = controllerOptions.disallowSelfAction;

  userID =
    typeof userID === 'string'
      ? userID
      : userID === true
        ? request.params.userID
        : await userID(request);

  if (!userID) {
    return { pass: false, errorMessage: $t('user.errors.missing_user_id') };
  }

  if (request._user?.id === userID) {
    return { pass: false, errorMessage: $t('session.errors.not_authorized') };
  }
});
