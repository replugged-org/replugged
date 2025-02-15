import Moment from "moment";
import { waitForProps } from "../webpack";

export default waitForProps<typeof Moment>("isMoment");
