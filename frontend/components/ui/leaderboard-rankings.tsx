"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface LeaderboardRankingItem {
  userId: string
  rank: number
  userName: string
  byline: string
  value: number
  displayed: boolean
}

interface LeaderboardRankingsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  rankings: LeaderboardRankingItem[]
  currentUserId?: string
  showPagination?: boolean
  defaultPageSize?: number
}

const LeaderboardRankings = React.forwardRef<
  HTMLDivElement,
  LeaderboardRankingsProps
>(
  (
    {
      className,
      rankings,
      currentUserId,
      showPagination = false,
      defaultPageSize = 10,
      ...props
    },
    ref
  ) => {
    const [currentPage, setCurrentPage] = React.useState(1)
    const pageSize = defaultPageSize
    const totalPages = Math.ceil(rankings.length / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedRankings = rankings.slice(startIndex, endIndex)

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        <div className="space-y-1">
          {paginatedRankings.map((ranking) => {
            const isCurrentUser = ranking.userId === currentUserId
            return (
              <div
                key={ranking.userId}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg px-4 py-3 transition-colors",
                  isCurrentUser
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 text-center">
                    <span className="font-semibold text-sm">
                      {ranking.rank}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {ranking.userName}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {ranking.byline}
                    </p>
                  </div>
                </div>
                <div className="font-semibold text-sm">
                  {ranking.value.toLocaleString()}
                </div>
              </div>
            )
          })}
        </div>

        {showPagination && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-md border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Previous
            </button>

            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-md border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Next
            </button>
          </div>
        )}
      </div>
    )
  }
)

LeaderboardRankings.displayName = "LeaderboardRankings"

export { LeaderboardRankings }
export type { LeaderboardRankingItem }
