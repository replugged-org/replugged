import { default as EntityBase } from './base';
import { MiniInjector } from '../modules/injector';

export default abstract class Coremod extends EntityBase {
  injector: MiniInjector;
  static entityType = 'Coremod';

  constructor (name: string) {
    super(name);
    this.injector = new MiniInjector();
  }

  abstract start (): void;
  abstract stop (): void;
}
