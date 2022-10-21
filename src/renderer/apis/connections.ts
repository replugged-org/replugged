import API from "../entities/api";
import { RepluggedConnection } from "../../types";

class ConnectionsAPI extends API {
  public connections: RepluggedConnection[] = [];

  public constructor() {
    super("dev.replugged.apis.Connections", "Connections");
  }

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

    return connections[type] || null;
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

  public fetchAccounts(id: string): Promise<any> {
    return Promise.all(this.filter((c) => c.enabled).map((c) => c.fetchAccount(id)));
  }
}

export default new ConnectionsAPI();
