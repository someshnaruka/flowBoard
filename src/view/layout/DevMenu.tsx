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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/view/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/view/ui/tooltip'
import { GrantsDialog } from './GrantsDialog'

const LATENCY_OPTIONS = [
  { value: '0', label: '0 ms', ms: 0 },
  { value: '300', label: '300 ms', ms: 300 },
  { value: '800', label: '800 ms', ms: 800 },
  { value: '1500', label: '1.5 s', ms: 1500 },
] as const

const FAILURE_OPTIONS = [
  { value: '0', label: '0%', rate: 0 },
  { value: '0.1', label: '10%', rate: 0.1 },
  { value: '0.25', label: '25%', rate: 0.25 },
  { value: '0.5', label: '50%', rate: 0.5 },
] as const

export function DevMenu() {
  const latencyMs = useFlowStore((state) => state.network.latencyMs)
  const failureRate = useFlowStore((state) => state.network.failureRate)
  const failNext = useFlowStore((state) => state.network.failNext)
  const setNetworkConfig = useFlowStore((state) => state.setNetworkConfig)
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
                Permissions & grants
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}

          <DropdownMenuLabel className="text-meta font-normal text-muted-foreground">
            Simulated network
          </DropdownMenuLabel>

          <DropdownMenuLabel className="pt-2 text-meta font-medium text-foreground">
            Latency
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={String(latencyMs)}
            onValueChange={(value) => {
              const option = LATENCY_OPTIONS.find((item) => item.value === value)
              if (option) {
                setNetworkConfig({ latencyMs: option.ms })
              }
            }}
          >
            {LATENCY_OPTIONS.map((option) => (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                className="rounded-control"
              >
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-meta font-medium text-foreground">
            Failure rate
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={String(failureRate)}
            onValueChange={(value) => {
              const option = FAILURE_OPTIONS.find((item) => item.value === value)
              if (option) {
                setNetworkConfig({ failureRate: option.rate })
              }
            }}
          >
            {FAILURE_OPTIONS.map((option) => (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                className="rounded-control"
              >
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />
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
