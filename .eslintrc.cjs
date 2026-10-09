const firebaseRulesPlugin = require('@firebase/eslint-plugin-security-rules');

module.exports = {
  plugins: ['@firebase/security-rules'],
  rules: {
    '@firebase/security-rules/no-insecure-rules': 'error'
  },
  ignorePatterns: ['dist/**/*']
};
