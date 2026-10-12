import { useState } from 'react'
import { Shield, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { useFlowStore } from '@/controller/store'
import { Button } from '@/view/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/view/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/view/ui/tooltip'
import { GrantsDialog } from './GrantsDialog'

export function DevMenu() {
  const failNext = useFlowStore((state) => state.network.failNext)
  const setFailNext = useFlowStore((state) => state.setFailNext)
  const isAdmin = useFlowStore(
    (state) => state.users[state.currentUserId]?.role === 'admin',
  )
  const [grantsOpen, setGrantsOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-control px-2.5 text-body"
                aria-label="Developer menu"
              >
                <SlidersHorizontal className="size-3.5" />
                Dev
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Dev menu</TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="end" className="w-56 rounded-card">
          {isAdmin ? (
            <>
              <DropdownMenuLabel className="text-meta font-normal text-muted-foreground">
                Admin
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="gap-2 rounded-control"
                onSelect={() => setGrantsOpen(true)}
              >
                <Shield className="size-3.5" />
                Access Management
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}

          <DropdownMenuLabel className="text-meta font-normal text-muted-foreground">
            Simulated network
          </DropdownMenuLabel>

          <DropdownMenuCheckboxItem
            checked={failNext}
            className="rounded-control"
            onCheckedChange={(checked) => {
              setFailNext(Boolean(checked))
              if (checked) {
                toast.message('Fail next mutation armed')
              }
            }}
          >
            Fail next mutation
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isAdmin ? (
        <GrantsDialog open={grantsOpen} onOpenChange={setGrantsOpen} />
      ) : null}
    </>
  )
}
