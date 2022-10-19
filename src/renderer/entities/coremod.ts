import { default as EntityBase } from './base';
import { MiniInjector } from '../modules/injector';
import settings from '../apis/settings';
import { NamespacedSettings } from '../apis/settings';
import { Settings } from '../../types/settings';
import { EntityType } from '../../types/entities';

export default abstract class Coremod<T extends Settings> extends EntityBase {
  abstract dependencies: string[];
  abstract dependents: string[];
  abstract optionalDependencies: string[];
  abstract optionalDependents: string[];

  protected injector: MiniInjector = new MiniInjector();
  protected settings: NamespacedSettings<T>;
  entityType = EntityType.COREMOD;

  constructor (id: string, name: string) {
    super(id, name);
    this.settings = settings.get<T>(id);
  }

  abstract start (): Promise<void>;
  abstract stop (): Promise<void>;
}
