import pluginVue from 'eslint-plugin-vue'
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

// Lint TypeScript + Vue + règles d'accessibilité (aide à viser WCAG 2.2 AA, ne remplace pas un audit).
export default defineConfigWithVueTs(
  { name: 'app/files-to-lint', files: ['**/*.{ts,mts,vue}'] },
  { name: 'app/files-to-ignore', ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  ...pluginVueA11y.configs['flat/recommended'],
  {
    rules: {
      // Les <label> du projet englobent leur champ OU utilisent for/id : les deux sont valides.
      'vuejs-accessibility/label-has-for': ['error', { required: { some: ['nesting', 'id'] } }],
    },
  },
)
