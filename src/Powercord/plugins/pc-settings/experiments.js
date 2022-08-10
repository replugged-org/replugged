// Credit to Beefers for this snippet

const { getModule } = require('powercord/webpack');

let hasEnabled = false;

async function enableExperiments () {
  if (hasEnabled) {
    return;
  }

  // Get the module used to get the current user, but not the one used elsewhere because discord™️
  const userMod = getModule([ 'getUsers' ], false).__proto__;

  // Get the connection open handler
  const { CONNECTION_OPEN } = (await getModule([ 'isDeveloper' ]))._dispatcher._orderedActionHandlers;

  function getHandler (handlerName) {
    return CONNECTION_OPEN.find((x) => x.name === handlerName).actionHandler;
  }

  // Call the handler with fake data and mask the error that will always occur
  try {
    getHandler('ExperimentStore')({
      user: { ...userMod.getCurrentUser(),
        flags: 1 },
      type: 'CONNECTION_OPEN'
    });
  } catch (e) {}

  // Patch getCurrentUser to always return the staff flag check as true
  const oldGCUser = userMod.getCurrentUser;
  userMod.getCurrentUser = () => ({ ...oldGCUser(),
    hasFlag: () => true });

  // Call the second handler without data now that the flag always returns true
  getHandler('DeveloperExperimentStore')();

  // Unpatch getCurrentUser
  userMod.getCurrentUser = oldGCUser;

  hasEnabled = true;
}

async function disableExperiments () {
  hasEnabled = false;
}

module.exports = {
  enableExperiments,
  disableExperiments
};
