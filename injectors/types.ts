export type platforms = 'stable' | 'ptb' | 'canary' | 'dev';
export type AppDirGetter = (platform: platforms) => Promise<string>;
