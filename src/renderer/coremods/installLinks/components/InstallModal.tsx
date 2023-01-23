import { common, components } from "@replugged";
import { AnyAddonManifest } from "src/types";
import { ModalProps } from "../../../modules/webpack/common/modal";
const { React } = common;
const { closeModal, openModal } = common.modal;
const { Button, Modal } = components;
const FormText = components.FormText.DEFAULT;

let modalKey: any;

function InstallModal(props: ModalProps, downloadable: AnyAddonManifest) {
  return (
    <Modal.ModalRoot {...props}>
      <Modal.ModalHeader>
        <FormText style={{ fontSize: "30px" }}>Install {downloadable.type}</FormText>
      </Modal.ModalHeader>
      <Modal.ModalContent>
        <FormText style={{ marginTop: "10px" }}>Placeholder</FormText>
      </Modal.ModalContent>
      <Modal.ModalFooter>
        <Button
          color={Button.Colors.GREEN}
          onClick={() => {
            closeModal(modalKey);
          }}>
          Send
        </Button>
      </Modal.ModalFooter>
    </Modal.ModalRoot>
  );
}

export function openNewModal(downloadable: AnyAddonManifest): any {
  modalKey = openModal((props: JSX.IntrinsicAttributes & ModalProps) => (
    <InstallModal {...props} {...downloadable} />
  ));
}
