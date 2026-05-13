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

export {};
