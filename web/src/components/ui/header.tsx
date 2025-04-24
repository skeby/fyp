"use client"

import { Button } from "./button"
import Coin from "@/assets/icons/coin.svg"

const Header = () => {
  return (
    <header className="bg-secondary sticky top-0 left-0 z-50 h-12 border-b">
      <div className="max-w-res flex h-full items-center justify-between gap-3 px-6">
        <p className="font-semibold">AdaptLearn</p>
        <div className="flex items-center gap-x-2">
          <Button
            variant="outline"
            className="flex h-8 items-center gap-2 rounded-lg border bg-transparent px-2 py-0"
          >
            <Coin />
            <span className="text-sm leading-2">200</span>
          </Button>
          <Button
            variant="outline"
            className="flex !size-8 items-center justify-center rounded-full bg-transparent p-0"
          >
            A
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
