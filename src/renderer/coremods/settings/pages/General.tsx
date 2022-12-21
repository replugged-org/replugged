import React from "../../../modules/webpack/common/react";

export const General = () => {
  const [hue, setHue] = React.useState(0);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => {
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
