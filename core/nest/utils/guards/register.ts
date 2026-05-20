import { randomUUID } from 'crypto';
import { ControllerOptions2, DefineGuard } from '#core/nest/types';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CONTROLLER_METADATA } from '../controllers';
import { Request } from 'express-serve-static-core';

const confidentialKey = randomUUID();
function getConfidential() {
  return confidentialKey;
}

export function registerGuard(
  name: string,
  handler: Parameters<DefineGuard>['0'],
) {
  Reflect.defineMetadata(name, handler, getConfidential);
}

@Injectable()
export class Guard implements CanActivate {
  constructor(
    @Inject(Reflector)
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const controllerOptions =
      this.reflector.getAllAndOverride<ControllerOptions2>(
        CONTROLLER_METADATA,
        [context.getHandler(), context.getClass()],
      );

    let response: ReturnType<Parameters<DefineGuard>['0']> | null = null;
    const names = Reflect.getMetadataKeys(getConfidential) as string[];

    for (const name of names) {
      const guard = Reflect.getMetadata(
        name,
        getConfidential,
      ) as Parameters<DefineGuard>['0'];

      try {
        response = await guard({ request, controllerOptions });
      } catch {
        response = { pass: false };
      }

      if (!response) continue;
      if (!response.pass) break;
    }

    if (response && !response.pass) {
      throw new ForbiddenException({
        message: response.errorMessage ?? $t('session.errors.not_authorized'),
      });
    }

    return true;
  }
}
