import { EditorView } from '@codemirror/view'

export const lightTheme = EditorView.theme({
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-scroller': {
    fontFamily: 'inherit',
  },
  '.cm-content': {
    padding: 0,
  },
  '.cm-line': {
    padding: 0,
    lineHeight: 1.6,
  },
  '.cm-hashtag': {
    padding: '0px 2px',
    borderRadius: '2px',
    backgroundColor: '#BEDBFF',
    color: '#51A2FF',
  },
})
