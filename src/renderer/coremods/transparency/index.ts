let observer: MutationObserver;

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
      switch (DiscordNative.process.platform) {
        case "win32": {
          const transparencyEffect = getComputedStyle(html).getPropertyValue("--window-win-blur");
          if (transparencyEffect === (await RepluggedNative.transparency.getEffect())) {
            return;
          }

          // @ts-expect-error @todo: Check if the transparency effect is valid?
          await RepluggedNative.transparency.applyEffect(transparencyEffect);
          break;
        }
        case "darwin": {
          const vibrancy = getComputedStyle(html).getPropertyValue("--window-vibrancy");
          if (vibrancy === (await RepluggedNative.transparency.getVibrancy())) {
            return;
          }

          // @ts-expect-error @todo: Check if the vibrancy is valid?
          await RepluggedNative.transparency.setVibrancy(vibrancy);
          break;
        }
      }
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
