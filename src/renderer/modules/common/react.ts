import type React from "react";
import { waitForProps } from "../webpack";

export default await waitForProps<typeof React>("createElement", "useState");
export type { React as _ }
