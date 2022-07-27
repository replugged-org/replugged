import { API } from 'powercord/entities';

/**
 * @typedef DiscordRpcEvent
 * @todo Dig into discord's more complex selectors (seem to be mongo-ish)
 * @todo Document validation field
 * @property {String} scope RPC scope required
 * @property {function(Object): void} handler RPC event handler
 * @property {any|undefined} validation Validator for incoming data
 */
type DiscordRpcEvent = {
  scope: string;
  handler: (data: any) => void;
  validation?: any;
}

/**
 * API to tinker with Discord's RPC socket
 * @property {Object.<String, function(String): Boolean>} scopes RPC Scopes
 * @property {Object.<String, DiscordRpcEvent>} scopes RPC Scopes
 */
class RpcAPI extends API {
  scopes: Record<string, (arg: string) => boolean> = {};
  events: Record<string, DiscordRpcEvent> = {};

  constructor () {
    super();

    this.scopes = {};
    this.events = {};
  }

  /**
   * Registers a RPC scope
   * @param {String} scope RPC scope
   * @param {function(String): Boolean} grant Grant method. Receives the origin as first argument
   * @emits RpcAPI#scopeAdded
   */
  registerScope (scope: string, grant: (arg: string) => boolean) {
    if (this.scopes[scope]) {
      throw new Error(`RPC scope ${scope} is already registered!`);
    }
    this.scopes[scope] = grant;
    this.emit('scopeAdded', scope);
  }

  /**
   * Registers a RPC event
   * @param {String} name Event name
   * @param {DiscordRpcEvent} properties RPC event properties
   * @emits RpcAPI#eventAdded
   */
  registerEvent (name: string, properties: DiscordRpcEvent) {
    if (this.events[name]) {
      throw new Error(`RPC event ${name} is already registered!`);
    }
    this.events[name] = properties;
    this.emit('eventAdded', name);
  }

  /**
   * Unregisters a scope
   * @param {String} scope Scope to unregister
   * @emits RpcAPI#scopeRemoved
   */
  unregisterScope (scope: string) {
    if (this.scopes[scope]) {
      delete this.scopes[scope];
      this.emit('scopeRemoved', scope);
    }
  }

  /**
   * Unregisters an event
   * @param {String} name Name of the event to unregister
   * @emits RpcAPI#eventRemoved
   */
  unregisterEvent (name: string) {
    if (this.events[name]) {
      delete this.events[name];
      this.emit('eventRemoved', name);
    }
  }
}

export default RpcAPI;
