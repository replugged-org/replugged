import API from './api';
import { RepluggedConnection } from '../../types';

module.exports = class ConnectionsAPI extends API {
  connections: RepluggedConnection[] = [];

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
};
