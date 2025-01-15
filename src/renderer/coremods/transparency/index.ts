import { Logger } from "@replugged";

let observer: MutationObserver;

function getRootProperty(property: string): string {
  const computedStyle = getComputedStyle(document.body);
  const value = computedStyle.getPropertyValue(property);

  return value;
}

function getRootStringProperty(property: string): string {
  const value = getRootProperty(property);
  return value.split('"')[1];
}

const logger = Logger.coremod("Transparency");

export function start(): void {
  let html = document.body.parentElement!;

  observer = new MutationObserver(async (mutations) => {
    let cssModified = false;
    for (const mutation of mutations) {
      if (mutation.target instanceof HTMLLinkElement && mutation.type === "attributes") {
        cssModified = true;
        break;
      }

      if (mutation.type !== "childList") continue;

      // Check for both added or removed css(like) nodes
      let changedNodes = Array.from(mutation.addedNodes).concat(Array.from(mutation.removedNodes));
      let cssLikeNodes = changedNodes.filter(
        (node) => node instanceof HTMLStyleElement || node instanceof HTMLLinkElement,
      );
      if (cssLikeNodes.length > 0) {
        cssModified = true;
        break;
      }
    }

    if (cssModified) {
      // Originally this used requestAnimationFrame but it took too long
      // so instead we setTimeout and pray. The setTimeout could be
      // shorter if we wanted, but it's hard to say if it would
      // work as consistently.
      setTimeout(async () => {
        switch (DiscordNative.process.platform) {
          case "win32": {
            const backgroundMaterial = getRootStringProperty("--window-background-material");
            if (backgroundMaterial !== (await RepluggedNative.transparency.getBackgroundMaterial())) {
              logger.log('Setting background material to:', backgroundMaterial);
              // @ts-expect-error @todo: Check if the transparency effect is valid?
              await RepluggedNative.transparency.setBackgroundMaterial(backgroundMaterial);
            }

            const backgroundColor = getRootProperty("--window-background-color");
            if (backgroundColor !== (await RepluggedNative.transparency.getBackgroundColor())) {
              logger.log('Setting background color to:', backgroundColor);
              await RepluggedNative.transparency.setBackgroundColor(backgroundColor);
            }
            break;
          }
          case "darwin": {
            const vibrancy = getRootStringProperty("--window-vibrancy");
            if (vibrancy === (await RepluggedNative.transparency.getVibrancy())) {
              break;
            }

            logger.log('Setting vibrancy effect to:', vibrancy);
            // @ts-expect-error @todo: Check if the vibrancy is valid?
            await RepluggedNative.transparency.setVibrancy(vibrancy);
            break;
          }
        }
      }, 100);
    }
  });

  observer.observe(html, {
    subtree: true,
    childList: true,
    // To handle any instances where a link has it's href changed.
    attributes: true,
    attributeFilter: ["href"],
  });
}

export function stop(): void {
  observer.disconnect();
}
