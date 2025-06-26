import React from "react"

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary"
}

export const Button = ({ variant = "primary", className = "", ...props }: Props) => {
  const base = "rounded-lg px-4 py-2 font-medium shadow-sm transition-all"
  const styles = variant === "primary"
    ? "bg-blue-600 text-white hover:bg-blue-700"
    : "bg-gray-200 text-black hover:bg-gray-300"

  return <button className={`${base} ${styles} ${className}`} {...props} />
}
