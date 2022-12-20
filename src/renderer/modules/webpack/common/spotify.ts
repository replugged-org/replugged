import { filters, waitForModule } from "..";

// @todo: type this
export default await waitForModule(filters.byProps("play", "pause", "inBrowser"));
