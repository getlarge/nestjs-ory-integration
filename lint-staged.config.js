module.exports = {
  'packages/**/*.{ts,tsx}': (files) => {
    return `nx affected -t typecheck --files=${files.join(',')}`;
  },
  'packages/**/*.{js,ts,jsx,tsx,json}': (files) => {
    return `npx nx affected -t lint --files=${files.join(',')}`;
  },
  '**/*.{js,ts,jsx,tsx,json}': [
    (files) => `npx nx format:write --files=${files.join(',')}`,
  ],
};
