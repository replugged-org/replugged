import type classnames from "classnames";
import { waitForModule } from "../webpack";
import { bySource } from "../webpack/filters";

export default await waitForModule<typeof classnames>(bySource("window.classNames="));
