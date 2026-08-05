import { Extension } from "@tiptap/core";
import Paragraph from "@tiptap/extension-paragraph";

/** FontSize mark-style extension that works on TextStyle */
export const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] as string[] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el: HTMLElement) => el.style.fontSize?.replace(/['"]/g, "") || null,
            renderHTML: (attrs: any) => {
              if (!attrs.fontSize) return {};
              return { style: `font-size: ${attrs.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }: any) =>
          chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }: any) =>
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    } as any;
  },
});

/** Replace default Paragraph to support has-dropcap class */
export const DropCapParagraph = Paragraph.extend({
  addAttributes() {
    return {
      dropcap: {
        default: false,
        parseHTML: (el: HTMLElement) => el.classList.contains("has-dropcap"),
        renderHTML: (attrs: any) => (attrs.dropcap ? { class: "has-dropcap" } : {}),
      },
    };
  },
  addCommands() {
    return {
      toggleDropCap:
        () =>
        ({ editor, commands }: any) => {
          const current = editor.getAttributes("paragraph").dropcap;
          return commands.updateAttributes("paragraph", { dropcap: !current });
        },
    } as any;
  },
});