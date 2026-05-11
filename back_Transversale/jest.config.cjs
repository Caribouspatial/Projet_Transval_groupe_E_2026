// jest.config.cjs
const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** 
 * @type {import('jest').ConfigWithTsJest} 
 */
module.exports = {
  preset: 'ts-jest',               // Utiliser ts-jest pour compiler le TypeScript
  testEnvironment: 'node',         // Environnement Node
  transform: {
    ...tsJestTransformCfg,         // Transforme les fichiers TS
  },
  testMatch: ['**/src/tests/**/*.test.ts'], // Tous les fichiers .test.ts dans src/tests
};