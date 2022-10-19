import * as repluggedLogger from '../modules/logger';
import {EntityType} from "../../types/entities";

export default abstract class EntityBase extends EventTarget {
  name: string;
  id: string;
  static entityType = EntityType.BASE;

  constructor (id: string, name: string) {
    super();
    this.id = id;
    this.name = name;
  }

  log (...args: unknown[]) {
    repluggedLogger.log((this.constructor as typeof EntityBase).entityType, this.name, void 0, ...args);
  }

  warn (...args: unknown[]) {
    repluggedLogger.warn((this.constructor as typeof EntityBase).entityType, this.name, void 0, ...args);
  }

  error (...args: unknown[]) {
    repluggedLogger.error((this.constructor as typeof EntityBase).entityType, this.name, void 0, ...args);
  }
}
