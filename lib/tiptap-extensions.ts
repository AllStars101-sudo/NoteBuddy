import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"

export interface CursorPositionOptions {
  onUpdate: (position: { from: number; to: number; text: string }) => void
}

export const CursorPosition = Extension.create<CursorPositionOptions>({
  name: "cursorPosition",

  addOptions() {
    return {
      onUpdate: () => {},
    }
  },

  addProseMirrorPlugins() {
    const { onUpdate } = this.options

    return [
      new Plugin({
        key: new PluginKey("cursorPosition"),
        view() {
          return {
            update: (view) => {
              const { state } = view
              const { selection } = state
              const { from, to } = selection

              // Get the text content up to the cursor position
              const text = state.doc.textBetween(0, from, " ")

              onUpdate({ from, to, text })

              return false
            },
          }
        },
      }),
    ]
  },
})

