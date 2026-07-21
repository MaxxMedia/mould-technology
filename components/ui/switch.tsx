'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-transparent p-1 shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:justify-end data-[state=unchecked]:justify-start data-[state=checked]:bg-[#1f2b44] data-[state=unchecked]:bg-[#73839b]',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block aspect-square h-full rounded-full bg-white shadow ring-0 transition-transform"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }