import React from "react"
import * as LucideIcons from "lucide-react"

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string
  className?: string
  size?: number
}

export function Icon({ name, className, size = 24, ...props }: IconProps) {
  const IconComponent = LucideIcons[name as keyof typeof LucideIcons] as React.FC<React.SVGProps<SVGSVGElement>> || LucideIcons.HelpCircle

  return (
    <IconComponent
      className={className}
      width={size}
      height={size}
      {...props}
    />
  )
} 