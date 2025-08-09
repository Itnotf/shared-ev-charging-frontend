// ESLint Flat Config for Vue2/3 + uni-app
import pluginVue from 'eslint-plugin-vue';

export default [
  // 1) Global ignore to exclude build outputs and third-party modules
  { ignores: ['unpackage/**', 'uni_modules/**', 'node_modules/**'] },

  // 2) Base Vue essential rules
  ...pluginVue.configs['flat/essential'],

  // 3) Project overrides (must be last to take precedence)
  {
    files: ['**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        uni: 'readonly',
        wx: 'readonly',
        getApp: 'readonly',
        getCurrentPages: 'readonly',
      },
    },
    plugins: { vue: pluginVue },
    rules: {
      'no-var': 'error',
      'prefer-const': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Vue specific adjustments for this project
      'vue/no-mutating-props': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-deprecated-destroyed-lifecycle': 'off',
    },
  },
];
