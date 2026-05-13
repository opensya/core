import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { ControllerOptions, HttpMethod } from '@nest/types/controllers';
import { RequestMethod } from '@nestjs/common';

export const IS_PUBLIC_KEY = '__opensya_is_public__';
export const ROLES = '__opensya_roles__';
export const JOB_ACCESS = '__opensya_job_access__';
export const DISALLOW_SELF_ACTION = '__opensya_disallow_self_action__';
export const CONTROLLER_METADATA = '__opensya_controller__';

export function Controller(options: ControllerOptions = {}): MethodDecorator {
  return (target, key, descriptor) => {
    options.name ??= _.kebabCase(
      target.constructor.name.replace(/Controller$/g, '') +
        `-${key.toString()}`,
    );

    options.method ??= 'GET';
    options.method = options.method.toUpperCase() as HttpMethod;

    options.path ??= '';

    globalThis.ALL_CONTROLLERS ??= {};
    ALL_CONTROLLERS[options.name] = options as any;

    if ('public' in options) SetMetadata(IS_PUBLIC_KEY, true);
    else {
      if ('roles' in options) SetMetadata(ROLES, options.roles);
      else if ('access' in options) SetMetadata(JOB_ACCESS, options.access);

      if (options.disallowSelfAction) {
        SetMetadata(DISALLOW_SELF_ACTION, options.disallowSelfAction);
      }
    }

    SetMetadata(PATH_METADATA, options.path);
    SetMetadata(METHOD_METADATA, RequestMethod[options.method]);
    SetMetadata(CONTROLLER_METADATA, options);

    function SetMetadata(key: string, value: unknown) {
      if (descriptor?.value) {
        Reflect.defineMetadata(key, value, descriptor.value);
      } else {
        Reflect.defineMetadata(key, value, target);
      }
    }

    return descriptor ?? target;
  };
}
