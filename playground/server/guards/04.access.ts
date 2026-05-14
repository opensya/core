import { MayBePromise } from '@opensya/share';
import { genObjectID } from '@nest/utils/database';
import { Request } from 'express';

declare module '@core/nest/types/controllers' {
  interface ControllerOptions2 {
    access?:
      | true
      | {
          jobID?: string | ((request: Request) => MayBePromise<string>);
          roles?: string[]; // TODO JobUser['role'][];
        };
  }
}

export default defineGuard(async ({ controllerOptions, request }) => {
  if (!controllerOptions.access) return;

  let access = controllerOptions.access;
  if (access === true) access = {};

  const jobID =
    typeof access.jobID === 'string'
      ? access.jobID
      : typeof access.jobID === 'function'
        ? await access.jobID(request)
        : request.params.jobID;

  if (!jobID) {
    return { pass: false, errorMessage: $t('job.errors.missing_job_id') };
  }

  const roles = access.roles;

  if (request._user.role !== 'admin') {
    const jobUserModel = getModel('jobUser');
    const jobUser = await jobUserModel.findOne({
      jobID: genObjectID(jobID),
      userID: genObjectID(request._user.id),
    });

    const r = {
      pass: false,
      errorMessage: $t('session.errors.not_authorized'),
    };

    if (!jobUser) return r;
    if (roles?.length && !roles.includes(jobUser.role)) return r;
  }
});
