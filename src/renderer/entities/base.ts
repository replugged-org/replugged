import * as repluggedLogger from '../modules/logger';

export default abstract class EntityBase extends EventTarget {
  name: string;
  static entityType = 'EntityBase';

  constructor (name: string) {
    super();
    this.name = name;
  }

  log (...args: unknown[]) {
    repluggedLogger.log((this.constructor as typeof EntityBase).entityType, this.name, void 0, ...args);
  }

  warn (...args: unknown[]) {
    repluggedLogger.warn((this.constructor as typeof EntityBase).entityType, this.name, void 0, ...args);
  }

  error (...args: unknown[]) {
    repluggedLogger.error((this.constructor as typeof EntityBase).entityType, this.name, void 0, ...args);
  }
}
