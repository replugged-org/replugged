import { default as Coremod } from './coremod';
import { MiniInjector } from '../modules/injector';

export default abstract class Plugin extends Coremod {
  static entityType = 'Plugin';

  constructor (name: string) {
    super(name);
    this.injector = new MiniInjector();
  }
}
