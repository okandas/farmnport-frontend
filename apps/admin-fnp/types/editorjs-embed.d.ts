declare module "@editorjs/embed" {
  import { BlockToolConstructable } from "@editorjs/editorjs"
  const Embed: BlockToolConstructable
  export default Embed
}

declare module "@editorjs/delimiter" {
  import { BlockToolConstructable } from "@editorjs/editorjs"
  const Delimiter: BlockToolConstructable
  export default Delimiter
}

declare module "@editorjs/quote" {
  import { BlockToolConstructable } from "@editorjs/editorjs"
  const Quote: BlockToolConstructable
  export default Quote
}

declare module "@editorjs/checklist" {
  import { BlockToolConstructable } from "@editorjs/editorjs"
  const Checklist: BlockToolConstructable
  export default Checklist
}
