import { waitForProps } from "../webpack";
import type React from "react";

export default await waitForProps<typeof React>("createElement", "useState");
