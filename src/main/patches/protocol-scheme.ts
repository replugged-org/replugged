import { protocol } from "electron";

const repluggedProtocol = {
  scheme: "replugged",
  privileges: {
    standard: true,
    secure: true,
    allowServiceWorkers: true,
    stream: true,
    supportFetchAPI: true,
  },
};

// Monkey patch to ensure our protocol is always included, even if Discord tries to override it with their own schemes.
const originalRegisterSchemesAsPrivileged = protocol.registerSchemesAsPrivileged.bind(protocol);
originalRegisterSchemesAsPrivileged([repluggedProtocol]);
protocol.registerSchemesAsPrivileged = (customSchemes: Electron.CustomScheme[]) => {
  const combinedSchemes = [repluggedProtocol, ...customSchemes];
  originalRegisterSchemesAsPrivileged(combinedSchemes);
};
