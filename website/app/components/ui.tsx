'use client'

import { highlight } from 'sugar-high'

export function Code({ code }: { code: string }) {
  const html = highlight(code)
  return (
    <div className='code-box'>
      <pre>
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  )
}

export function Desc({ text }: { text: string }) {
  // Parse backticks into <code> elements
  const parts = text.split(/(`[^`]+`)/)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('`') && part.endsWith('`') ? (
          <code key={i}>{part.slice(1, -1)}</code>
        ) : (
          part
        ),
      )}
    </>
  )
}
