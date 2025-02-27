import type React from "react";
import { waitForProps } from "../webpack";

export default waitForProps<typeof React>("createElement", "useState");
