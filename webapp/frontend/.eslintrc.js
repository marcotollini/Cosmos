module.exports = {
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/vue3-essential',
    '@vue/typescript/recommended',
    'eslint:recommended'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  },
  "plugins": [
    "prettier"
  ],
}
