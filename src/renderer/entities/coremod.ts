import { default as EntityBase } from './base';
import { MiniInjector } from '../modules/injector';
import settings, { NamespacedSettings } from "../apis/settings";
import { Settings } from '../../types/settings';
import { EntityType } from '../../types/entities';

export default abstract class Coremod<T extends Settings> extends EntityBase {
  injector: MiniInjector;
  settings: NamespacedSettings<T>;
  static entityType = EntityType.COREMOD;

  constructor (id: string, name: string) {
    super(id, name);
    this.injector = new MiniInjector();
    this.settings = settings.get<T>(id);
  }

  abstract start (): void;
  abstract stop (): void;
}
