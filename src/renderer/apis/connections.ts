import type { ReCelledConnection } from "../../types";
import type { ConnectedAccount } from "../../types/discord";

class ConnectionsAPI extends EventTarget {
  public connections: ReCelledConnection[] = [];

  public get map(): typeof Array.prototype.map {
    return this.connections.map.bind(this.connections);
  }

  public get filter(): typeof Array.prototype.filter {
    return this.connections.filter.bind(this.connections);
  }

  public get(type: string): ReCelledConnection | undefined {
    return this.connections.find((c) => c.type === type);
  }

  public registerConnection(connection: ReCelledConnection): void {
    if (this.get(connection.type)) {
      throw new Error("This type of connection already exists!");
    }
    this.connections.push(connection);
  }

  public unregisterConnection(type: string): void {
    this.connections = this.connections.filter((c) => c.type !== type);
  }

  public fetchAccounts(id: string): Promise<ConnectedAccount[]> {
    return Promise.all(this.filter((c) => c.enabled).map((c) => c.fetchAccount(id)));
  }
}

export default new ConnectionsAPI();
