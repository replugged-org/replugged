import * as repluggedLogger from '../modules/logger';
import { EntityType } from '../../types/entities';

export default abstract class EntityBase extends EventTarget {
  public name: string;
  public id: string;
  public abstract entityType: EntityType;

  public constructor (id: string, name: string) {
    super();
    this.id = id;
    this.name = name;
  }

  public log (...args: unknown[]): void {
    repluggedLogger.log(this.entityType, this.name, void 0, ...args);
  }

  public warn (...args: unknown[]): void {
    repluggedLogger.warn(this.entityType, this.name, void 0, ...args);
  }

  public error (...args: unknown[]): void {
    repluggedLogger.error(this.entityType, this.name, void 0, ...args);
  }
}
