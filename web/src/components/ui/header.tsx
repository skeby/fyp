import { Button } from "./button"

const Header = () => {
  return (
    <header className="bg-secondary border-b sticky top-0 left-0 z-50 h-12">
      <div className="max-w-res flex h-full items-center justify-between gap-3 px-6">
        <p className="font-semibold">AdaptLearn</p>
        <div className="flex items-center gap-x-2">
          <Button variant="outline" className="h-8 px-2 py-0 rounded-lg bg-transparent">
            <span className="text-xs leading-2">200</span>
          </Button>
          <div className="flex size-8 cursor-pointer items-center justify-center rounded-full border">
            A
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
