import { EntityType } from "../../types/entities";
import Coremod from "./coremod";

export default abstract class Target extends Coremod {
  public entityType = EntityType.LIFECYCLE;

  public start(): void {
    this.log("Start target hit");
  }

  public stop(): void {
    this.log("Stop target hit");
  }
}
