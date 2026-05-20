export type ClientConfig = {
  components?: { prefix?: string };
};

declare module '@opensya/config' {
  interface OpensyaConfig {
    ['client']?: boolean | ClientConfig;
  }

  interface OpensyaConfigOutput {
    ['client']: false | ClientConfig;
  }
}

export {};
