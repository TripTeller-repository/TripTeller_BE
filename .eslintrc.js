module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'prettier/prettier': ['error', { printWidth: 120 }], // 줄바꿈 120 적용을 위해 해당 부분 추가
    '@typescript-eslint/interface-name-prefix': 'off', // 인터페이스의 이름에 접두사를 지정
    '@typescript-eslint/explicit-function-return-type': 'off', // 함수의 반환 타입을 명시적으로 지정할 것
    '@typescript-eslint/explicit-module-boundary-types': 'off', // 모듈의 반환 타입을 명시적으로 지정
    '@typescript-eslint/no-explicit-any': 'off', // typescript에서 any 허용 여부
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
};
