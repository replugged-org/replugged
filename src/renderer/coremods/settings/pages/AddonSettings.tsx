import { ErrorBoundary, Modal, Text } from "@components";
import { Messages } from "@common/i18n";
import { modal } from "@common";
const { ModalRoot, ModalHeader, ModalContent, ModalCloseButton } = Modal;
import type { RepluggedPlugin, RepluggedTheme } from "src/types";

export function showAddonSettings(
  addon: RepluggedPlugin | RepluggedTheme,
  Element: React.ComponentType,
) {
  let modalKey: string;

  modalKey = modal.openModal((props) => (
    <ModalRoot {...props} size="large">
      <ModalHeader>
        <Text variant="heading-lg/semibold" style={{ flexGrow: 1 }}>
          {addon.manifest.name} {Messages.SETTINGS}
        </Text>
        <ModalCloseButton onClick={() => modal.closeModal(modalKey)} />
      </ModalHeader>
      <ModalContent style={{ marginTop: "20px" }}>
        <ErrorBoundary>
          <Element />
        </ErrorBoundary>
      </ModalContent>
    </ModalRoot>
  ));
}
