import type Lodash from "lodash";
import { waitForProps } from "../webpack";

export default await waitForProps<typeof Lodash>("debounce");
