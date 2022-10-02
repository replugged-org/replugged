/* eslint-disable @typescript-eslint/no-empty-function */
export default class API extends EventTarget {
  async _load () {
    try {
      if (typeof this.startAPI === 'function') {
        await this.startAPI();
      }
      this.log('API loaded');
    } catch (e: any) {
      this.error('An error occurred during initialization!', e);
    }
  }

  async _unload () {
    try {
      if (typeof this.apiWillUnload === 'function') {
        await this.apiWillUnload();
      }
      this.log('API unloaded');
    } catch (e: any) {
      this.error('An error occurred during shutting down! It\'s heavily recommended to reload Discord to ensure there is no conflicts.', e);
    }
  }

  async startAPI () {}

  async apiWillUnload () {}

  log (...data: string[]) {
    console.log(`%c[Replugged:API:${this.constructor.name}]`, 'color: #7289da', ...data);
  }

  warn (...data: string[]) {
    console.warn(`%c[Replugged:API:${this.constructor.name}]`, 'color: #e04151', ...data);
  }

  error (...data: string[]) {
    console.error(`%c[Replugged:API:${this.constructor.name}]`, 'color: #7289da', ...data);
  }
}
