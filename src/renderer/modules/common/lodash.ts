import { waitForProps } from "../webpack";
import type Lodash from "lodash";

export default await waitForProps<typeof Lodash>("debounce");
