"use client"

import { useEffect, useRef, useCallback } from "react"

interface EditorJSComponentProps {
  initialData?: any
  onChange?: (data: any) => void
  placeholder?: string
}

export function EditorJSComponent({ initialData, onChange, placeholder = "Start writing..." }: EditorJSComponentProps) {
  const editorRef = useRef<any>(null)
  const holderRef = useRef<HTMLDivElement>(null)

  const initEditor = useCallback(async () => {
    if (editorRef.current || !holderRef.current) return

    const EditorJS = (await import("@editorjs/editorjs")).default
    const Header = (await import("@editorjs/header")).default
    const List = (await import("@editorjs/list")).default
    const ImageTool = (await import("@editorjs/image")).default
    const Embed = (await import("@editorjs/embed")).default
    const Delimiter = (await import("@editorjs/delimiter")).default
    const Quote = (await import("@editorjs/quote")).default
    const Checklist = (await import("@editorjs/checklist")).default

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL + "/v1"

    const editor = new EditorJS({
      holder: holderRef.current,
      placeholder,
      data: initialData || undefined,
      tools: {
        header: {
          class: Header,
          config: { levels: [2, 3, 4], defaultLevel: 2 },
        },
        list: { class: List, inlineToolbar: true },
        image: {
          class: ImageTool,
          config: {
            endpoints: {
              byFile: `${baseUrl}/user/image/upload-editorjs`,
            },
            field: "product_image",
            additionalRequestHeaders: {
              Authorization: `Bearer ${document.cookie.split("token=")[1]?.split(";")[0] || ""}`,
            },
          },
        },
        embed: { class: Embed },
        delimiter: Delimiter,
        quote: { class: Quote, inlineToolbar: true },
        checklist: { class: Checklist, inlineToolbar: true },
      },
      onChange: async () => {
        if (onChange && editorRef.current) {
          const data = await editorRef.current.save()
          onChange(data)
        }
      },
    })

    await editor.isReady
    editorRef.current = editor
  }, [initialData, onChange, placeholder])

  useEffect(() => {
    initEditor()
    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy()
        editorRef.current = null
      }
    }
  }, [initEditor])

  return (
    <div className="border rounded-lg min-h-[400px] bg-background">
      <div ref={holderRef} className="prose prose-sm max-w-none p-4" />
    </div>
  )
}
