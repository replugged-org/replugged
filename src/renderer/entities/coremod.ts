import { default as EntityBase } from './base';

export default class Coremod extends EntityBase {
  static entityType = 'Coremod';

  start () {
    throw new Error(`Cannot start prototype of ${(this.constructor as typeof Coremod).entityType}`);
  }

  stop () {
    throw new Error(`Cannot stop prototype of ${(this.constructor as typeof Coremod).entityType}`);
  }
}
