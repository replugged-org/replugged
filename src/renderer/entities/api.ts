import { EntityType } from '../../types/entities';
import { default as EntityBase } from './base';

/* eslint-disable @typescript-eslint/no-empty-function */
export default abstract class API extends EntityBase {
  static entityType = EntityType.API;
}
