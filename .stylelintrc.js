module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    'import-notation': 'string',
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'no-empty-source': null,
    'at-rule-no-unknown': [true, {
      ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen']
    }],
    'color-function-notation': 'modern',
    'alpha-value-notation': 'percentage',
    'font-family-name-quotes': 'always-where-recommended',
    'selector-pseudo-class-case': 'lower',
    'property-no-vendor-prefix': true,
    'value-no-vendor-prefix': true,
  },
  ignoreFiles: [
    'node_modules/**/*',
    'build/**/*',
    '.next/**/*',
    '**/*.js',
    '**/*.jsx',
    '**/*.ts',
    '**/*.tsx'
  ]
}