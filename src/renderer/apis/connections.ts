import type { RepluggedConnection } from "../../types";
import type { ConnectedAccount } from "../../types/discord";

class ConnectionsAPI extends EventTarget {
  public connections: RepluggedConnection[] = [];

  public get map(): typeof Array.prototype.map {
    return this.connections.map.bind(this.connections);
  }

  public get filter(): typeof Array.prototype.filter {
    return this.connections.filter.bind(this.connections);
  }

  public get(type: string): RepluggedConnection {
    const connections: Record<string, RepluggedConnection> = {};
    for (const element of this.connections) {
      connections[element.type] = element;
    }

    return connections[type];
  }

  public registerConnection(connection: RepluggedConnection): void {
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
