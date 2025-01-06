import type Lodash from "lodash";
import { waitForProps } from "../webpack";

export default waitForProps<typeof Lodash>("debounce");
