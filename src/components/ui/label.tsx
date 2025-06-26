import React from "react"

type Props = React.LabelHTMLAttributes<HTMLLabelElement>

export const Label = ({ className = "", ...props }: Props) => {
  return (
    <label className={`block text-sm font-medium text-gray-700 mb-1 ${className}`} {...props} />
  )
}
