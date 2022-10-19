import Coremod from '../../entities/coremod';
import { patchPlaintext } from '../../modules/webpack';

export default class ExperimentsMod extends Coremod<{
  enabled: boolean
}> {
  dependencies = [ 'dev.replugged.lifecycle.WebpackReady' ];
  dependents = [ 'dev.replugged.lifecycle.WebpackStart' ];
  optionalDependencies = [];
  optionalDependents = [];

  constructor () {
    super('dev.replugged.coremods.Experiments', 'experiments');
  }

  async start () {
    const enabled = await this.settings.get('enabled') ?? false;

    if (enabled) {
      patchPlaintext([ {
        find: /\.displayName="(Developer)?ExperimentStore"/,
        replacements: [ {
          match: "window.GLOBAL_ENV.RELEASE_CHANNEL",
          replace: '"staging"'
        } ]
      } ]);
    }
  }

  async stop () {
    // placeholder
  }
}
