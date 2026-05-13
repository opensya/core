import 'reflect-metadata';

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createConnection } from 'mongoose';

import { initDatabase, registerModel } from '../register';

vi.mock('mongoose', () => {
  return {
    ConnectionStates: {
      disconnected: 0,
      connected: 1,
    },

    createConnection: vi.fn(),
  };
});

describe('models registry', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubGlobal('_env', {
      NEST_DATABASE_URL: 'mongodb://localhost:27017/opensya-test',
    });
  });

  it('should register models and expose getModel globally', async () => {
    const compiledModel = {
      name: 'Config',
      findOne: vi.fn(),
      create: vi.fn(),
    };

    const connection = {
      readyState: 0,

      models: {
        Config: compiledModel,
      },

      model: vi.fn(),
    };

    vi.mocked(createConnection).mockReturnValue(connection as any);

    const schema = {
      paths: {},
    };

    registerModel({
      name: 'Config',
      schema,
    } as any);

    await initDatabase();

    expect(createConnection).toHaveBeenCalledWith(
      'mongodb://localhost:27017/opensya-test',
      {},
    );

    expect(connection.model).toHaveBeenCalledWith('Config', schema);

    expect(getModel('Config')).toBe(compiledModel);
  });
});
