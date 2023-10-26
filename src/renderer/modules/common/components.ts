import { waitForProps } from "../webpack";
import type { ButtonType } from "../components/ButtonItem";

// Expand this as needed
interface DiscordComponents {
  Button: ButtonType;
  FormText: unknown;
  MenuItem: unknown;
}

export default await waitForProps<DiscordComponents>("FormText", "MenuItem");
