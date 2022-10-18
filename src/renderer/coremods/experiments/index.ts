import Coremod from '../../entities/coremod';
import {patchPlaintext} from "../../modules/webpack";

export default class ExperimentsMod extends Coremod {
  constructor () {
    super('experiments');
  }

  start () {
    patchPlaintext([{
      find: 'Object.defineProperties(this,{isDeveloper',
      replacements: [{
        match: /(?<={isDeveloper:\{[^}]+,get:function\(\)\{return )\w/,
        replace: 'true'
      }]
    }])
  }

  stop () {
    // placeholder
  }
}
