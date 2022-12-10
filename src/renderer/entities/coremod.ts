import { default as EntityBase } from "./base";
import { Injector } from "../modules/injector";
import settings, { NamespacedSettings } from "../apis/settings";
import { Settings } from "../../types/settings";
import { EntityType } from "../../types/entities";
import { Awaitable } from "../../types/util";

export default abstract class Coremod<
  T extends Settings = Record<string, never>,
> extends EntityBase {
  protected injector: Injector = new Injector();
  protected settings: NamespacedSettings<T>;
  public entityType = EntityType.COREMOD;

  public constructor(id: string, name: string) {
    super(id, name);
    this.settings = settings.get<T>(id);
  }

  public abstract start(): Awaitable<void>;
  public abstract stop(): Awaitable<void>;
  public abstract runPlaintextPatches(): void;
}
