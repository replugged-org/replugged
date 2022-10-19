import { default as Coremod } from './coremod';
import { Settings } from '../../types/settings';
import { EntityType } from '../../types/entities';

export default abstract class Plugin<T extends Settings> extends Coremod<T> {
  entityType = EntityType.PLUGIN;
}
