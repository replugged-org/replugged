import Coremod from '../../entities/coremod';
import { getModule } from '../../modules/webpack';

export default class SettingsMod extends Coremod<{}> {
  dependencies = ['dev.replugged.lifecycle.WebpackReady']
  dependents = ['dev.replugged.lifecycle.WebpackStart']

  constructor () {
    super('dev.replugged.coremods.Settings', 'settings');
  }

  async start () {
    // placeholder
  }

  async stop () {
    // placeholder
  }
}
