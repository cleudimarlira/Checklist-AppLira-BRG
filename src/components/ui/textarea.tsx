import React from "react"

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = ({ className = "", ...props }: Props) => {
  return (
    <textarea
      className={`w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  )
}
