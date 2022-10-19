import Coremod from '../../entities/coremod';
import { getModule } from '../../modules/webpack';

export default class SettingsMod extends Coremod<{}> {
  constructor () {
    super('dev.replugged.coremods.Settings', 'settings');
  }

  start () {
    // placeholder
  }

  stop () {
    // placeholder
  }
}
