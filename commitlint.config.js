module.exports = {
  extends: ["@commitlint/config-conventional"],
  ignores: [
    (commit) => {
      // ignore merge commits
      return /^Merge branch .+ into .+$/.test(commit);
    },
  ],
};
