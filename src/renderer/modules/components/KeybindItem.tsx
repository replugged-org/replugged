import { React, i18n } from "@common";
import { FormItem, Tooltip } from ".";
import { filters, waitForModule } from "@webpack";

import "./KeybindItem.css";

type RefCallback = (node: {
  setState: (state: { mode: "DEFAULT" | "RECORDING" }, ...args: unknown[]) => void;
}) => void;

interface RecorderProps {
  ref?: RefCallback;
  disabled?: boolean;
  onChange?: (value: number[][]) => void;
  defaultValue?: number[][];
}
type RecorderType = React.FC<RecorderProps>;
interface KeybindProps extends RecorderProps {
  clearable?: boolean;
  value?: number[][];
  defaultValue?: never;
}

export type KeybindType = React.FC<KeybindProps>;

interface KeybindItemProps extends KeybindProps {
  note?: string;
  style?: React.CSSProperties;
}

export type KeybindItemType = React.FC<React.PropsWithChildren<KeybindItemProps>>;

const Recorder = await waitForModule<RecorderType>(filters.bySource("handleComboChange"));

export const Keybind = (props: KeybindProps): React.ReactElement => {
  props.clearable ??= true;
  const [value, setValue] = React.useState(props.value || []);
  const [isRecording, setRecording] = React.useState(false);
  const handleState = React.useCallback((node?: Parameters<RefCallback>[0]) => {
    if (node) {
      const nodeSetState = node.setState.bind(node);
      node.setState = (state, ...args) => {
        setRecording(state.mode === "RECORDING");
        nodeSetState(state, ...args);
      };
    }
  }, []);

  const handleChange = (value: number[][]): void => {
    setValue(value);
    props.onChange?.(value);
  };

  return (
    <span className="replugged-keybind-item-container">
      <Recorder
        ref={handleState}
        disabled={props.disabled}
        defaultValue={value}
        onChange={handleChange}
      />
      {props.clearable && (value.length || 0) > 0 && (
        <Tooltip
          className="replugged-keybind-item-clear-tooltip"
          text={i18n.intl.formatToPlainString(i18n.t.CLEAR, {})}>
          <button
            className="replugged-keybind-item-clear-button"
            onClick={() => handleChange([])}
            disabled={isRecording || props.disabled}
          />
        </Tooltip>
      )}
    </span>
  );
};

export const KeybindItem = (
  props: React.PropsWithChildren<KeybindItemProps>,
): React.ReactElement => {
  return (
    <FormItem
      title={props.children}
      style={{ marginBottom: 20, ...props.style }}
      note={props.note}
      disabled={props.disabled}
      notePosition="after"
      divider>
      <Keybind {...props} />
    </FormItem>
  );
};
