import { filters, getFunctionBySource, waitForModule } from "@webpack";

import type * as Design from "discord-client-types/discord_app/design/web";

export interface CustomModalType {
  ModalRoot: Design.ModalRoot;
  ModalHeader: Design.ModalHeader;
  ModalContent: Design.ModalContent;
  ModalFooter: Design.ModalFooter;
  ModalCloseButton: Design.ModalCloseButton;
  ModalListContent: Design.ModalListContent;
}

// TODO: Replace with Modal from Mana Design System
const ModalComponents = await waitForModule<Record<string, CustomModalType[keyof CustomModalType]>>(
  filters.bySource(/\i\.withCircleBackground/),
);

const remappedModalComponents: CustomModalType = {
  ModalRoot: getFunctionBySource(ModalComponents, "MODAL_ROOT_LEGACY")!,
  ModalHeader: getFunctionBySource(ModalComponents, "headerIdIsManaged")!,
  ModalContent: getFunctionBySource(ModalComponents, "scrollbarType")!,
  ModalFooter: getFunctionBySource(ModalComponents, "HORIZONTAL_REVERSE")!,
  ModalCloseButton: getFunctionBySource(ModalComponents, "withCircleBackground")!,
  ModalListContent: getFunctionBySource(ModalComponents, /className:\i,scrollerRef/)!,
};

export default remappedModalComponents;
