import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders user/admin authored Markdown. react-markdown does not interpret
 * raw HTML unless rehype-raw is added — intentionally left out so this stays
 * safe against XSS by construction.
 */
export function ContentRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-primary">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
