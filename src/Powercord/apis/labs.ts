import { API } from "powercord/entities";

/**
 * @typedef PowercordExperiment
 * @property {String} id
 * @property {String} name
 * @property {Number} date
 * @property {String} description
 * @property {function({Boolean} enabled)|function()|null} callback
 */

type PowercordExperiment = {
  id: string;
  name: string;
  date: number;
  description: string;
  callback: (enabled: boolean) => void | null;
};

/**
 * @property {PowercordExperiment[]} experiments
 */
class LabsAPI extends API {
  experiments: PowercordExperiment[] = [];

  /**
   * Registers an experiment
   * @param {PowercordExperiment} experiment
   */
  registerExperiment(experiment: PowercordExperiment) {
    this.experiments.push(experiment);
  }

  /**
   * Unregisters an experiment
   * @param {String} experimentId
   */
  unregisterExperiment(experimentId: string) {
    this.experiments = this.experiments.filter((e) => e.id !== experimentId);
  }

  /**
   * @param {String} experimentId
   * @returns {Boolean} Whether the experiment is enabled or not
   */
  isExperimentEnabled(experimentId: string): boolean {
    const settings = powercord.settings.get("labs", {});
    return !!settings[experimentId];
  }

  /**
   * Enables an experiment
   * @param {String} experimentId
   */
  enableExperiment(experimentId: string) {
    const experiment = this.experiments.find((e) => e.id === experimentId);
    if (!experiment) {
      throw new Error(
        `Tried to enable a non-registered experiment "${experimentId}"`
      );
    }
    powercord.settings.set("labs", {
      ...powercord.settings.get("labs", {}),
      [`${experimentId}`]: true,
    });
    if (experiment.callback) {
      experiment.callback(true);
    }
  }

  /**
   * Disables an experiment
   * @param {String} experimentId
   */
  disableExperiment(experimentId: string) {
    const experiment = this.experiments.find((e) => e.id === experimentId);
    if (!experiment) {
      throw new Error(
        `Tried to enable a non-registered experiment "${experimentId}"`
      );
    }
    const settings = powercord.settings.get("labs", {});
    if (settings[experimentId]) {
      delete settings[experimentId];
    }
    powercord.settings.set("labs", settings);
    if (experiment.callback) {
      experiment.callback(false);
    }
  }
}

export default LabsAPI;
