import { default as EntityBase } from './base';
import { MiniInjector } from '../modules/injector';

export default class Coremod extends EntityBase {
  injector: MiniInjector;
  static entityType = 'Coremod';

  constructor (name: string) {
    super(name);
    this.injector = new MiniInjector();
  }

  start () {
    throw new Error(`Cannot start prototype of ${(this.constructor as typeof Coremod).entityType}`);
  }

  stop () {
    throw new Error(`Cannot stop prototype of ${(this.constructor as typeof Coremod).entityType}`);
  }
}
