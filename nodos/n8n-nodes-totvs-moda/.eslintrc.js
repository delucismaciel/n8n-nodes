module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    extraFileExtensions: ['.json'],
  },
  ignorePatterns: ['.eslintrc.js', '**/*.js', '**/node_modules/**', '**/dist/**'],
  overrides: [
    {
      files: ['nodes/**/*.ts'],
      plugins: ['eslint-plugin-n8n-nodes-base'],
      extends: ['plugin:n8n-nodes-base/nodes'],
      rules: {
        'n8n-nodes-base/node-execute-block-missing-continue-on-fail': 'off',
        'n8n-nodes-base/node-resource-description-filename-against-convention': 'off',
        'n8n-nodes-base/node-param-description-miscased-json': 'off',
        'n8n-nodes-base/node-param-description-miscased-url': 'off',
        'n8n-nodes-base/node-param-display-name-miscased': 'off',
        'n8n-nodes-base/node-param-option-name-duplicate': 'off',
      },
    },
  ],
};
