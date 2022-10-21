import { EntityType } from '../../types/entities';
import Coremod from './coremod';

export default abstract class Target extends Coremod<Record<string, never>> {
  public entityType = EntityType.LIFECYCLE;

  public async start (): Promise<void> {
    this.log('Start target hit');
  }

  public async stop (): Promise<void> {
    this.log('Stop target hit');
  }
}
