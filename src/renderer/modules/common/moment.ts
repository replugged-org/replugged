import type Moment from "moment";
import { waitForProps } from "../webpack";

export default await waitForProps<typeof Moment>("isMoment");
