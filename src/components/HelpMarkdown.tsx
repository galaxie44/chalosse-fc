"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";

export function HelpMarkdown({ source }: { source: string }) {
  return (
    <div className="help-md">
      <ReactMarkdown
        components={{
          a: ({ href, children }) => {
            if (!href) return <span>{children}</span>;
            const internal = href.startsWith("/");
            if (internal) {
              return (
                <Link href={href} className="help-link">
                  {children}
                </Link>
              );
            }
            if (href.startsWith("https://")) {
              return (
                <a
                  href={href}
                  className="help-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              );
            }
            return <span>{children}</span>;
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
