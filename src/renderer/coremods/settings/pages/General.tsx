import React from "@common/react";

export const General = (): React.ReactElement => {
  const [hue, setHue] = React.useState(0);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => {
      // ESLint thinks that hue is not a number for some reason.
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      setHue((hue + 1) % 360);
    });
    return () => cancelAnimationFrame(id);
  }, [hue]);

  return (
    <div style={{ color: "var(--text-normal)" }}>
      Replugged settings are coming soon™.
      <br />
      <br />
      <br />
      <span style={{ color: `hsl(${hue}, 100%, 50%)` }}>Wake up. Wake up. Wake up.</span>
    </div>
  );
};
