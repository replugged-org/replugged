import { default as Coremod } from './coremod';
import { MiniInjector } from '../modules/injector';

export default class Plugin extends Coremod {
  injector: MiniInjector;
  static entityType = 'Plugin';

  constructor (name: string) {
    super(name);
    this.injector = new MiniInjector();
  }
}
