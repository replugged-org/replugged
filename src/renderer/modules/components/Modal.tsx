import { filters, getFunctionBySource, waitForModule } from "@webpack";
import type React from "react";

enum ModalTransitionState {
  ENTERING,
  ENTERED,
  EXITING,
  EXITED,
  HIDDEN,
}

interface ModalRootProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  children: React.ReactNode;
  transitionState?: ModalTransitionState;
  size?: "small" | "medium" | "large" | "dynamic";
  role?: "alertdialog" | "dialog";
  fullscreenOnMobile?: boolean;
  hideShadow?: boolean;
  onAnimationEnd?(): string;
  returnRef?: React.Ref<unknown>;
}

interface ModalHeaderProps {
  children: React.ReactNode;
  direction?: string;
  justify?: string;
  align?: string;
  wrap?: string;
  separator?: boolean;
  className?: string;
}

interface ModalContentProps extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  scrollerRef?: React.Ref<unknown>;
  scrollbarType?: "auto" | "none" | "thin";
}

type ModalFooterProps = ModalHeaderProps;

interface ModalCloseButtonProps {
  onClick(): void;
  withCircleBackground?: boolean;
  hideOnFullscreen?: boolean;
  focusProps?: Record<string, unknown>;
  className?: string;
}

export interface ModalType {
  ModalRoot: React.FC<ModalRootProps>;
  ModalHeader: React.FC<ModalHeaderProps>;
  ModalContent: React.FC<ModalContentProps>;
  ModalFooter: React.FC<ModalFooterProps>;
  ModalCloseButton: React.FC<ModalCloseButtonProps>;
}

const ModalComponents = await waitForModule<Record<string, ModalType[keyof ModalType]>>(
  filters.bySource(/\w+\.withCircleBackground/),
);

export default {
  ModalRoot: getFunctionBySource(ModalComponents, /\w+\.root/)!,
  ModalHeader: getFunctionBySource(ModalComponents, /\w+\.header,/)!,
  ModalContent: getFunctionBySource(ModalComponents, /\w+\.content/)!,
  ModalFooter: getFunctionBySource(ModalComponents, /\w+\.footerSeparator/)!,
  ModalCloseButton: getFunctionBySource(ModalComponents, /\w+\.closeWithCircleBackground/)!,
} as ModalType;
