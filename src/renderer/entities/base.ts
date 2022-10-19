import * as repluggedLogger from '../modules/logger';
import {EntityType} from "../../types/entities";

export default abstract class EntityBase extends EventTarget {
  name: string;
  id: string;
  abstract entityType: EntityType;

  constructor (id: string, name: string) {
    super();
    this.id = id;
    this.name = name;
  }

  log (...args: unknown[]) {
    repluggedLogger.log(this.entityType, this.name, void 0, ...args);
  }

  warn (...args: unknown[]) {
    repluggedLogger.warn(this.entityType, this.name, void 0, ...args);
  }

  error (...args: unknown[]) {
    repluggedLogger.error(this.entityType, this.name, void 0, ...args);
  }
}
