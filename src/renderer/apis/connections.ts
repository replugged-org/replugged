import API from '../entities/api';
import { RepluggedConnection } from '../../types';

class ConnectionsAPI extends API {
  connections: RepluggedConnection[] = [];

  constructor () {
    super('dev.replugged.apis.Connections', 'Connections');
  }

  get map () {
    return this.connections.map.bind(this.connections);
  }

  get filter () {
    return this.connections.filter.bind(this.connections);
  }

  registerConnection (connection: RepluggedConnection) {
    if (this.get(connection.type)) {
      throw new Error('This type of connection already exists!');
    }
    this.connections.push(connection);
  }

  unregisterConnection (type: string) {
    this.connections = this.connections.filter(c => c.type !== type);
  }

  fetchAccounts (id: string) {
    return Promise.all(
      this.filter(c => c.enabled).map(c => c.fetchAccount(id))
    );
  }

  get (type: string) {
    const connections: Record<string, RepluggedConnection> = {};
    for (const element of this.connections) {
      connections[element.type] = element;
    }

    return connections[type] || null;
  }
}

export default new ConnectionsAPI();
