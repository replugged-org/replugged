import  React  from "@common/react";

import { FormItem, Text } from ".";
import { KeyboardEvent } from "electron";
import "./KeybindItem.css";

type ValueArray = Array<{
  altKey: boolean | undefined;
  code: string | undefined;
  ctrlKey: boolean | undefined;
  key: string | undefined;
  keyCode: number | undefined;
  metaKey: boolean | undefined;
  shiftKey: boolean | undefined;
}>;

interface ButtonsProps {
  isRecording: boolean;
  toggleRecording: () => void;
  recordedKeybind: ValueArray;
  clearKeybind: () => void;
}

interface KeybindProps {
  title?: string;
  children?: string;
  note?: string;
  value: ValueArray;
  placeholder?: string;
  onChange: (newValue: ValueArray) => void;
}
interface KeybindState {
  recordedKeybind: ValueArray;
  currentlyPressed: number[];
  isRecording: boolean;
  isEditing: boolean;
  timer: null | NodeJS.Timer;
}

interface ExtendedKeyboardEvent extends KeyboardEvent {
  code: string | undefined;
  key: string | undefined;
  keyCode: number | undefined;
}
export type KeybindType = React.ComponentClass<KeybindProps, KeybindState>;

const Buttons: React.FC<ButtonsProps> = (props) => {
  if (!props.recordedKeybind.length && !props.isRecording) {
    return (
      <div className="buttons">
        <div
          className={`button ${props.isRecording ? "recording" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            props.toggleRecording();
          }}>
          <svg
            className="icon"
            fill={props.isRecording ? "#ff0000" : "var(--channel-icon)"}
            viewBox="0 0 24 24"
            style={{ width: "24px", height: "24px" }}>
            <path d="M19.745 5a2.25 2.25 0 0 1 2.25 2.25v9.505a2.25 2.25 0 0 1-2.25 2.25H4.25A2.25 2.25 0 0 1 2 16.755V7.25A2.25 2.25 0 0 1 4.25 5h15.495Zm-2.495 9.5H6.75l-.102.007a.75.75 0 0 0 0 1.486L6.75 16h10.5l.102-.007a.75.75 0 0 0 0-1.486l-.102-.007ZM16.5 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-2.995 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-3 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-3 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM6 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm2.995 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm3 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm3 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm3 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
          </svg>
          <Text.Normal className="button-text">Record Keybind</Text.Normal>
        </div>
      </div>
    );
  }

  if (props.isRecording) {
    return (
      <div className="buttons">
        <div
          className={`button ${props.isRecording ? "recording" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            props.toggleRecording();
          }}>
          <svg
            className="icon"
            fill={props.isRecording ? "#ff0000" : "var(--channel-icon)"}
            viewBox="0 0 24 24"
            style={{ width: "24px", height: "24px" }}>
            <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm3.53 6.47-.084-.073a.75.75 0 0 0-.882-.007l-.094.08L12 10.939l-2.47-2.47-.084-.072a.75.75 0 0 0-.882-.007l-.094.08-.073.084a.75.75 0 0 0-.007.882l.08.094L10.939 12l-2.47 2.47-.072.084a.75.75 0 0 0-.007.882l.08.094.084.073a.75.75 0 0 0 .882.007l.094-.08L12 13.061l2.47 2.47.084.072a.75.75 0 0 0 .882.007l.094-.08.073-.084a.75.75 0 0 0 .007-.882l-.08-.094L13.061 12l2.47-2.47.072-.084a.75.75 0 0 0 .007-.882l-.08-.094-.084-.073.084.073Z" />
          </svg>
          <Text.Normal className="button-text">Stop Recording</Text.Normal>
        </div>
      </div>
    );
  }

  return (
    <div className="buttons">
      <div
        className={`button ${props.isRecording ? "recording" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          props.toggleRecording();
        }}>
        <svg
          className="icon"
          fill={props.isRecording ? "#ff0000" : "var(--channel-icon)"}
          viewBox="0 0 24 24"
          style={{ width: "24px", height: "24px" }}>
          <path d="M19.745 5a2.25 2.25 0 0 1 2.25 2.25v9.505a2.25 2.25 0 0 1-2.25 2.25H4.25A2.25 2.25 0 0 1 2 16.755V7.25A2.25 2.25 0 0 1 4.25 5h15.495Zm-2.495 9.5H6.75l-.102.007a.75.75 0 0 0 0 1.486L6.75 16h10.5l.102-.007a.75.75 0 0 0 0-1.486l-.102-.007ZM16.5 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-2.995 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-3 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-3 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM6 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm2.995 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm3 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm3 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm3 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
        </svg>
        <Text.Normal className="button-text">Edit Keybind</Text.Normal>
      </div>
      <div
        className={`button ${props.isRecording ? "recording" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          props.clearKeybind();
        }}>
        <svg
          className="icon"
          fill={props.isRecording ? "#ff0000" : "var(--channel-icon)"}
          viewBox="0 0 24 24"
          style={{ width: "24px", height: "24px" }}>
          <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm3.53 6.47-.084-.073a.75.75 0 0 0-.882-.007l-.094.08L12 10.939l-2.47-2.47-.084-.072a.75.75 0 0 0-.882-.007l-.094.08-.073.084a.75.75 0 0 0-.007.882l.08.094L10.939 12l-2.47 2.47-.072.084a.75.75 0 0 0-.007.882l.08.094.084.073a.75.75 0 0 0 .882.007l.094-.08L12 13.061l2.47 2.47.084.072a.75.75 0 0 0 .882.007l.094-.08.073-.084a.75.75 0 0 0 .007-.882l-.08-.094L13.061 12l2.47-2.47.072-.084a.75.75 0 0 0 .007-.882l-.08-.094-.084-.073.084.073Z" />
        </svg>
        <Text.Normal className="button-text">Clear Keybind</Text.Normal>
      </div>
    </div>
  );
};

export default class KeybindRecorder extends React.Component<KeybindProps, KeybindState> {
  public constructor(props: KeybindProps) {
    super(props);
    this.state = {
      recordedKeybind: props.value ?? [],
      currentlyPressed: [],
      isRecording: false,
      isEditing: false,
      timer: null,
    };
  }

  public resetTimer(): void {
    clearTimeout(this.state.timer!);
  }

  public stopRecording(): void {
    this.setState({
      isRecording: false,
      currentlyPressed: [],
    });
    this.props.onChange(this.state.recordedKeybind);
  }

  public startRecording(): void {
    this.setState({
      isRecording: true,
      recordedKeybind: [],
      currentlyPressed: [],
      timer: setTimeout(() => {
        this.stopRecording();
      }, 3000),
    });
  }

  public editRecording(): void {
    this.setState({
      isRecording: true,
      isEditing: true,
      currentlyPressed: [],
      timer: setTimeout(() => {
        this.stopRecording();
      }, 3000),
    });
  }

  public clearKeybind(): void {
    this.setState({
      recordedKeybind: [],
      currentlyPressed: [],
    });
    this.props.onChange([]);
  }

  public toggleRecording(): void {
    if (this.state.isRecording) {
      this.stopRecording();
    } else if (this.state.recordedKeybind.length) {
      this.editRecording();
    } else {
      this.startRecording();
    }
  }

  public handleKeyDown(event: ExtendedKeyboardEvent): void {
    this.resetTimer();
    const { isRecording, recordedKeybind, isEditing } = this.state;
    if (
      isRecording &&
      event?.keyCode &&
      (!recordedKeybind.some((ck) => ck?.keyCode === event?.keyCode) || isEditing)
    ) {
      this.setState((prevState) => ({
        recordedKeybind: isEditing
          ? [
              {
                altKey: event.altKey,
                code: event.code,
                ctrlKey: event.ctrlKey,
                key: event.key,
                keyCode: event.keyCode,
                metaKey: event.metaKey,
                shiftKey: event.shiftKey,
              },
            ]
          : [
              ...prevState.recordedKeybind,
              {
                altKey: event.altKey,
                code: event.code,
                ctrlKey: event.ctrlKey,
                key: event.key,
                keyCode: event.keyCode,
                metaKey: event.metaKey,
                shiftKey: event.shiftKey,
              },
            ],
        currentlyPressed: [...prevState.currentlyPressed, event.keyCode!],
      }));
      if (isEditing) {
        this.setState({
          isEditing: false,
        });
      }
    }
  }

  public handleKeyUp(event: ExtendedKeyboardEvent): void {
    const { isRecording } = this.state;
    if (isRecording) {
      this.setState((prevState) => ({
        currentlyPressed: prevState.currentlyPressed.filter((ps) => ps === event.keyCode),
      }));
    }
  }

  public componentDidMount(): void {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  public componentWillUnmount(): void {
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
    document.removeEventListener("keyup", this.handleKeyUp.bind(this));
  }

  public componentDidUpdate(_prevProps: KeybindProps, prevState: KeybindState): void {
    const { isRecording, currentlyPressed } = this.state;
    if (isRecording && currentlyPressed.length === 0 && prevState.currentlyPressed.length !== 0) {
      this.stopRecording();
    }
  }

  public render(): React.ReactNode {
    const { recordedKeybind, isRecording } = this.state;

    return (
      <FormItem
        title={this.props.title ?? this.props.children}
        style={{ marginBottom: 20 }}
        note={this.props.note}
        notePosition="after"
        divider={true}>
        <div
          className={`rp-keybind-container ${isRecording ? "recording" : ""}`}
          onClick={this.toggleRecording.bind(this)}>
          <Text.H4 className="text text-truncate">
            {recordedKeybind?.length
              ? recordedKeybind
                  ?.map((rk) =>
                    rk?.code?.toLowerCase()?.includes("right")
                      ? `RIGHT ${rk?.key?.toUpperCase()}`
                      : rk?.key?.toUpperCase(),
                  )
                  .join(" + ")
              : this.props.placeholder ?? "No Keybind Set"}
          </Text.H4>
          <Buttons
            isRecording={isRecording}
            toggleRecording={this.toggleRecording.bind(this)}
            recordedKeybind={recordedKeybind}
            clearKeybind={this.clearKeybind.bind(this)}
          />
        </div>
      </FormItem>
    );
  }
}
