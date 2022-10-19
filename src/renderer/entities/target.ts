import { EntityType } from "../../types/entities";
import Coremod from "./coremod";

export default abstract class Target extends Coremod<{}> {
  entityType = EntityType.LIFECYCLE;

  async start() {
    this.log("Start target hit")
  }

  async stop() {
    this.log("Stop target hit")
  }
}