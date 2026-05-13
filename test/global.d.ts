declare global {
  var _config: Record<string, any>;
  var _env: Record<string, any>;

  var _nestConfig: {
    controllers: any[];
    services: any[];
    models: any[];
    guards: any[];
  };

  var _nestApp: any;
}

declare global {
  var _env: {
    NEST_DATABASE_URL?: string;
    [key: string]: any;
  };

  function getModel(name: string): any;
}

declare global {
  function getModel(name: string): any;
}

declare global {
  function useService(name: string): any;
}

export {};
