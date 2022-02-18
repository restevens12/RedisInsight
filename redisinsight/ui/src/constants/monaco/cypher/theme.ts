import { monaco } from 'react-monaco-editor'

export const darkThemeRules = [
  { token: 'function', foreground: 'BFBC4E' }
]

export const lightThemeRules = [
  { token: 'function', foreground: '795E26' }
]

export const cypherDarkTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: darkThemeRules,
  colors: {}
}

export const cypherLightTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: lightThemeRules,
  colors: {}
}
