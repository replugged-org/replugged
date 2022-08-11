// Credit to Beefers and several others for this snippet

const { getModule } = require('powercord/webpack');
const { findInTree } = require('powercord/util');

let hasEnabled = false;

async function enableExperiments () {
  if (hasEnabled) {
    return;
  }

  const userMod = getModule([ 'getUsers' ], false).__proto__;
  const developerModule = await getModule([ 'isDeveloper' ]);

  const nodes = Object.values(findInTree(developerModule, (o) => o?.nodes).nodes);

  function getHandler (handlerName) {
    return nodes.find((x) => x.name === handlerName).actionHandler;
  }

  // Call the handler with fake data and mask the error that will always occur
  try {
    const overlayHandler = getHandler('ExperimentStore').OVERLAY_INITIALIZE;
    overlayHandler({
      user: { ...userMod.getCurrentUser(),
        flags: 1 }
    });
  } catch (e) {}

  // Patch getCurrentUser to always return the staff flag check as true
  const oldGCUser = userMod.getCurrentUser;
  userMod.getCurrentUser = () => ({ ...oldGCUser(),
    hasFlag: () => true });

  // Call the second handler without data now that the flag always returns true
  const connectionHandler = getHandler('DeveloperExperimentStore').CONNECTION_OPEN;
  connectionHandler();

  // Unpatch getCurrentUser
  userMod.getCurrentUser = oldGCUser;

  hasEnabled = true;
}

function disableExperiments () {
  hasEnabled = false;
}

module.exports = {
  enableExperiments,
  disableExperiments
};
