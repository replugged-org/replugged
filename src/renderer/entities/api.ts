import { EntityType } from "../../types/entities";
import { default as EntityBase } from "./base";

export default abstract class API extends EntityBase {
  public entityType = EntityType.API;
}
