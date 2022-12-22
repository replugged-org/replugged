import { ObjectExports } from "../../../types";
import { filters, getFunctionBySource, waitForModule } from "../webpack";

const mod = await waitForModule(filters.bySource("().closeWithCircleBackground"));

const modal = {
  ModalRoot: getFunctionBySource("().root", mod as ObjectExports),
  ModalHeader: getFunctionBySource("().header", mod as ObjectExports),
  ModalContent: getFunctionBySource("().content", mod as ObjectExports),
  ModalFooter: getFunctionBySource("().footerSeparator", mod as ObjectExports),
  ModalCloseButton: getFunctionBySource("().closeWithCircleBackground", mod as ObjectExports),
};

export default modal;
