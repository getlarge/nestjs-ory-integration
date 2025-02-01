module.exports = {
  'packages/**/*.{ts,tsx}': (files) => {
    return `nx affected -t typecheck --base HEAD~1 --files=${files.join(',')}`;
  },
  'packages/**/*.{js,ts,jsx,tsx,json}': (files) => {
    return `npx nx affected -t lint --base HEAD~1 --files=${files.join(',')}`;
  },
  '**/*.{js,ts,jsx,tsx,json}': [
    (files) => `npx nx format:write --files=${files.join(',')}`,
  ],
};
