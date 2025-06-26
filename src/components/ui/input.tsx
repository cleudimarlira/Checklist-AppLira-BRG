import React from "react"

type Props = React.InputHTMLAttributes<HTMLInputElement>

export const Input = ({ className = "", ...props }: Props) => {
  return (
    <input
      className={`w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  )
}
