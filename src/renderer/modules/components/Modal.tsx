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

const ModalComponents = await waitForModule<Record<string, CustomModalType[keyof CustomModalType]>>(
  filters.bySource(/\i\.withCircleBackground/),
);

const remappedModalComponents: CustomModalType = {
  ModalRoot: getFunctionBySource(ModalComponents, /\i\.root/)!,
  ModalHeader: getFunctionBySource(ModalComponents, /\i\.header,/)!,
  ModalContent: getFunctionBySource(ModalComponents, /\i\.content/)!,
  ModalFooter: getFunctionBySource(ModalComponents, /\i\.footerSeparator/)!,
  ModalCloseButton: getFunctionBySource(ModalComponents, /\i\.closeWithCircleBackground/)!,
  ModalListContent: getFunctionBySource(ModalComponents, /className:\i,scrollerRef/)!,
};

export default remappedModalComponents;
