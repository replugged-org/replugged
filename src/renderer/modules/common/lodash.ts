// eslint-disable-next-line node/no-extraneous-import
import type Lodash from "lodash";
import { waitForProps } from "../webpack";

export default await waitForProps<typeof Lodash>("debounce");
