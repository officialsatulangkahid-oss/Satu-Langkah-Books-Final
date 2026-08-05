import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Twitter, Linkedin, Facebook, Link2, Quote } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: string;
  title: string;
  url: string;
  onCopyLink: () => void;
  onCopyQuote: () => void;
}

const ShareQuoteDialog = ({ open, onOpenChange, quote, title, url, onCopyLink, onCopyQuote }: Props) => {
  const shareUrl = `${url}#quote`;
  const text = `"${quote}" — ${title}`;

  const targets = [
    {
      label: "Twitter / X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bagikan Kutipan</DialogTitle>
        </DialogHeader>

        <blockquote className="rounded-xl border-l-2 border-gold bg-muted/50 px-4 py-3 text-sm italic leading-relaxed text-foreground/80">
          {quote}
        </blockquote>

        <div className="grid gap-2 pt-1">
          {targets.map(({ label, icon: Icon, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              {label}
            </a>
          ))}
          <button
            type="button"
            onClick={onCopyLink}
            className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Link2 className="h-4 w-4 text-muted-foreground" />
            Copy Link
          </button>
          <button
            type="button"
            onClick={onCopyQuote}
            className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Quote className="h-4 w-4 text-muted-foreground" />
            Copy Quote
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareQuoteDialog;