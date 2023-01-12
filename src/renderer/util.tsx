import { Fiber } from "react-reconciler";
import { ModalProps } from "./modules/components/Modal";
import { Button, FormText, Modal } from "./modules/components";
import { modal } from "@common";

/**
 * Loads a stylesheet into the document
 * @param path Path to the stylesheet
 * @returns Link element
 */
export const loadStyleSheet = (path: string): HTMLLinkElement => {
  const el = document.createElement("link");
  el.rel = "stylesheet";
  el.href = `${path}?t=${Date.now()}`;
  document.head.appendChild(el);

  return el;
};

/**
 * Wait for an element to be added to the DOM
 * @param selector Element selector
 */
export async function waitFor(selector: string): Promise<Element> {
  let element: Element | null = null;

  while (!element) {
    element = document.querySelector(selector);
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  return element;
}

/**
 * Get the React instance of an element
 * @param element Element to get the React instance of
 * @returns React instance
 * @throws If the React instance could not be found
 */
export function getReactInstance(element: Element): Fiber | null {
  const keys = Object.keys(element);
  const reactKey = keys.find((key) => key.startsWith("__reactFiber$"));
  if (!reactKey) {
    throw new Error("Could not find react fiber");
  }
  // @ts-expect-error Doesn't like the dynamic key I guess
  return element[reactKey];
}

/**
 * Get the React owner instance of an element
 * @param element Element to get the React owner instance of
 * @returns React owner instance
 * @throws If the React owner instance could not be found
 */
export function getOwnerInstance(element: Element): React.Component & Record<string, unknown> {
  let current = getReactInstance(element);
  while (current) {
    const owner = current.stateNode;
    if (owner && !(owner instanceof Element)) {
      return owner;
    }
    current = current.return;
  }
  throw new Error("Could not find react owner");
}

/**
 * Force updates a rendered React component by its DOM selector
 * @param selector The DOM selector to force update
 * @param all Whether all elements matching that selector should be force updated
 */
export function forceUpdateElement(selector: string, all = false): void {
  const elements = (
    all ? [...document.querySelectorAll(selector)] : [document.querySelector(selector)]
  ).filter(Boolean) as Element[];

  elements.forEach((element) => getOwnerInstance(element)?.forceUpdate());
}

export type ConfirmModalProps = {
  onCancel?: () => unknown;
  onConfirm: () => unknown;
  title: string;
  note?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function createConfirmModal(props: ConfirmModalProps): Promise<boolean> {
  let modalKey: string;

  return new Promise((resolve, _) => {
    modalKey = modal.openModal((p: ModalProps) => (
      <Modal.ModalRoot {...p}>
        <Modal.ModalHeader>
          <FormText.DEFAULT style={{ fontSize: "30px" }}>{props.title}</FormText.DEFAULT>
        </Modal.ModalHeader>
        <Modal.ModalContent>
          <FormText.DEFAULT>{props.note}</FormText.DEFAULT>
        </Modal.ModalContent>
        <Modal.ModalFooter>
          <Button
            color={Button.Colors.TRANSPARENT}
            look={Button.Looks.LINK}
            onClick={() => {
              props.onCancel?.();
              modal.closeModal(modalKey);
              resolve(false);
            }}>
            {props.cancelLabel ?? "Cancel"}
          </Button>
          <Button
            color={Button.Colors.GREEN}
            onClick={() => {
              props.onConfirm();
              modal.closeModal(modalKey);
              resolve(true);
            }}>
            {props.confirmLabel ?? "Confirm"}
          </Button>
        </Modal.ModalFooter>
      </Modal.ModalRoot>
    ));
  });
}
