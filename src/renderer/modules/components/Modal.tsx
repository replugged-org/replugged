import { filters, getFunctionBySource, waitForModule } from "@webpack";

import type * as Design from "discord-client-types/discord_app/design/web";

export interface CustomModalType {
  ModalRoot: Design.ModalRoot;
  ModalHeader: Design.ModalHeader;
  ModalContent: Design.ModalContent;
  ModalFooter: Design.ModalFooter;
  ModalCloseButton: Design.ModalCloseButton;
}

const ModalComponents = await waitForModule<Record<string, CustomModalType[keyof CustomModalType]>>(
  filters.bySource(/\w+\.withCircleBackground/),
);

const remappedModalComponents: CustomModalType = {
  ModalRoot: getFunctionBySource(ModalComponents, /\w+\.root/)!,
  ModalHeader: getFunctionBySource(ModalComponents, /\w+\.header,/)!,
  ModalContent: getFunctionBySource(ModalComponents, /\w+\.content/)!,
  ModalFooter: getFunctionBySource(ModalComponents, /\w+\.footerSeparator/)!,
  ModalCloseButton: getFunctionBySource(ModalComponents, /\w+\.closeWithCircleBackground/)!,
};

export default remappedModalComponents;
