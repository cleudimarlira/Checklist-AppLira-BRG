import React from "react"

export const Card = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`bg-white rounded-2xl shadow p-6 ${className}`} {...props} />
  )
}

export const CardHeader = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={`mb-4 ${className}`} {...props} />
}

export const CardTitle = ({ className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
  return <h2 className={`text-xl font-bold ${className}`} {...props} />
}

export const CardContent = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={`space-y-4 ${className}`} {...props} />
}

export const CardFooter = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={`mt-4 border-t pt-4 text-sm text-gray-500 ${className}`} {...props} />
}
