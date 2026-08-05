import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { Color } from "@tiptap/extension-color";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, Heading3,
  Image as ImageIcon, Link2, Undo, Redo, Minus, Code, Type, ALargeSmall,
} from "lucide-react";
import { uploadContentImage } from "@/lib/uploadImage";
import { toast } from "sonner";
import { FontSize, DropCapParagraph } from "./editorExtensions";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ value, onChange, placeholder }: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ paragraph: false }),
      DropCapParagraph,
      TextStyle,
      FontFamily.configure({ types: ["textStyle"] }),
      Color.configure({ types: ["textStyle"] }),
      FontSize,
      Image.configure({ inline: false, HTMLAttributes: { class: "rounded-xl my-6 mx-auto" } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      Placeholder.configure({ placeholder: placeholder || "Mulai menulis…" }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral max-w-none min-h-[400px] focus:outline-none px-5 py-4 prose-headings:font-bold prose-headings:text-heading prose-p:text-foreground/85 prose-a:text-primary",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) return null;

  const handleImageUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        toast.loading("Mengupload gambar…", { id: "img-upload" });
        const url = await uploadContentImage(file);
        editor.chain().focus().setImage({ src: url }).run();
        toast.success("Gambar berhasil diupload", { id: "img-upload" });
      } catch (e: any) {
        toast.error(e.message || "Gagal upload gambar", { id: "img-upload" });
      }
    };
    input.click();
  };

  const handleAddLink = () => {
    const url = window.prompt("URL tujuan:");
    if (!url) return;
    editor.chain().focus().toggleLink({ href: url }).run();
  };

  const btn = (active: boolean) =>
    `h-8 w-8 p-0 ${active ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`;

  const currentFontFamily = editor.getAttributes("textStyle").fontFamily || "";
  const currentFontSize = editor.getAttributes("textStyle").fontSize || "";
  const dropcapActive = !!editor.getAttributes("paragraph").dropcap;

  const FONT_FAMILIES = [
    { label: "Default", value: "" },
    { label: "Sans (Plus Jakarta)", value: "'Plus Jakarta Sans', sans-serif" },
    { label: "Serif (Lora)", value: "'Lora', Georgia, serif" },
    { label: "Display (Playfair)", value: "'Playfair Display', Georgia, serif" },
    { label: "Mono", value: "ui-monospace, Menlo, monospace" },
  ];
  const FONT_SIZES = [
    { label: "Default", value: "" },
    { label: "XS", value: "0.85rem" },
    { label: "S", value: "0.95rem" },
    { label: "M", value: "1.06rem" },
    { label: "L", value: "1.2rem" },
    { label: "XL", value: "1.4rem" },
    { label: "2XL", value: "1.7rem" },
    { label: "3XL", value: "2.1rem" },
  ];

  const selectCls =
    "h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/30 px-2 py-1.5">
        <Button type="button" variant="ghost" size="sm" className={btn(editor.isActive("heading", { level: 1 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className={btn(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <select
          aria-label="Jenis font"
          className={selectCls}
          value={currentFontFamily}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) editor.chain().focus().unsetFontFamily().run();
            else editor.chain().focus().setFontFamily(v).run();
          }}
        >
          {FONT_FAMILIES.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
        </select>
        <select
          aria-label="Ukuran font"
          className={selectCls}
          value={currentFontSize}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) (editor.chain().focus() as any).unsetFontSize().run();
            else (editor.chain().focus() as any).setFontSize(v).run();
          }}
        >
          {FONT_SIZES.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
        </select>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button type="button" variant="ghost" size="sm" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className={btn(editor.isActive("code"))} onClick={() => editor.chain().focus().toggleCode().run()}><Code className="h-4 w-4" /></Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button type="button" variant="ghost" size="sm" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className={btn(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className="h-4 w-4" /></Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          title="Drop Cap (paragraf saat ini)"
          className={btn(dropcapActive)}
          onClick={() => (editor.chain().focus() as any).toggleDropCap().run()}
        >
          <ALargeSmall className="h-4 w-4" />
        </Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button type="button" variant="ghost" size="sm" className={btn(editor.isActive("link"))} onClick={handleAddLink}><Link2 className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleImageUpload}><ImageIcon className="h-4 w-4" /></Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => editor.chain().focus().undo().run()}><Undo className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => editor.chain().focus().redo().run()}><Redo className="h-4 w-4" /></Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;