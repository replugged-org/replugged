import Coremod from '../../entities/coremod';

export default class SettingsMod extends Coremod<Record<string, never>> {
  dependencies = [ 'dev.replugged.lifecycle.WebpackReady' ];
  dependents = [ 'dev.replugged.lifecycle.WebpackStart' ];

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
