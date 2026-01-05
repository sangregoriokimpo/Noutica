import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

type MarkdownRendererProps = {
  markdown: string;
  className?: string;
};

export default function MarkdownRenderer({ markdown, className }: MarkdownRendererProps) {
  return (
    <div className={className ? `markdown ${className}` : "markdown"}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
