import Coremod from '../../entities/coremod';
import {patchPlaintext} from "../../modules/webpack";

export default class ExperimentsMod extends Coremod<{
  enabled: boolean
}> {
  dependencies = ['dev.replugged.lifecycle.WebpackReady']
  dependents = ['dev.replugged.lifecycle.WebpackStart']
  optionalDependencies = []
  optionalDependents = []

  constructor () {
    super('dev.replugged.coremods.Experiments', 'experiments');
  }

  async start () {
    const enabled = await this.settings.get("enabled") ?? false

    if (enabled) {
      patchPlaintext([{
        find: 'Object.defineProperties(this,{isDeveloper',
        replacements: [{
          match: /(?<={isDeveloper:\{[^}]+,get:function\(\)\{return )\w/,
          replace: 'true'
        }]
      }])
    }
  }

  async stop () {
    // placeholder
  }
}
