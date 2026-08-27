"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface LeaderboardRanking {
  userId: string
  userName: string
  rank: 1 | 2 | 3
  value: number
}

interface LeaderboardPodiumProps extends React.HTMLAttributes<HTMLDivElement> {
  rankings: LeaderboardRanking[]
}

const LeaderboardPodium = React.forwardRef<
  HTMLDivElement,
  LeaderboardPodiumProps
>(({ className, rankings, ...props }, ref) => {
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank)
  const second = sorted.find((r) => r.rank === 2)
  const first = sorted.find((r) => r.rank === 1)
  const third = sorted.find((r) => r.rank === 3)

  const podiumOrder = [second, first, third].filter(Boolean) as LeaderboardRanking[]

  return (
    <div
      ref={ref}
      className={cn("flex items-end justify-center gap-4", className)}
      {...props}
    >
      {podiumOrder.map((ranking, index) => {
        const heights = ["h-32", "h-48", "h-24"]
        const medals = ["🥈", "🥇", "🥉"]
        const bgColors = ["bg-slate-600", "bg-yellow-500", "bg-orange-600"]

        return (
          <div
            key={ranking.userId}
            className="flex flex-col items-center gap-2"
          >
            <div className="text-3xl">{medals[index]}</div>
            <div
              className={cn(
                "w-24 rounded-t-lg flex items-end justify-center pb-4 text-white font-bold text-sm",
                bgColors[index],
                heights[index]
              )}
            >
              <div className="text-center">
                <div className="text-lg font-bold">{ranking.rank}</div>
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm max-w-[80px] truncate">
                {ranking.userName}
              </p>
              <p className="text-muted-foreground text-xs">
                {ranking.value.toLocaleString()}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
})

LeaderboardPodium.displayName = "LeaderboardPodium"

export { LeaderboardPodium }
