export default {
  "*.{ts,tsx,js,mjs,cjs}": (filenames) => {
    const joinedNames = filenames.join(" ");

    const commands = [
      `prettier --color --check ${joinedNames}`,
      `eslint --color ${joinedNames}`,
      `cspell --color ${joinedNames}`,
      `tsc --noEmit --pretty`,
    ];

    return `concurrently --kill-others-on-fail ${commands.map((x) => `"${x}"`).join(" ")}`;
  },
};
