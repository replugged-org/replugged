import { components } from "../../../replugged";
const { SwitchItem } = components;

export const General = () => {
  const [ checkie, setCheckie ] = React.useState(false);
  return <div>
    wakeup wakeup wakeup
    <SwitchItem
      note="hi"
      value={checkie}
      onChange={() => setCheckie(!checkie)}
    >
      WEGWEG
    </SwitchItem>
  </div>;
};
