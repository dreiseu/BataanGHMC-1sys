import * as React from "react"
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    MoreHorizontalIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
    return (
        <nav
            role="navigation"
            aria-label="pagination"
            data-slot="pagination"
            className={cn("mx-auto flex w-full justify-center", className)}
            {...props}
        />
    )
}

function PaginationContent({
    className,
    ...props
}: React.ComponentProps<"ul">) {
    return (
        <ul
            data-slot="pagination-content"
            className={cn("flex items-center gap-0.5", className)}
            {...props}
        />
    )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
    return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
    isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
    React.ComponentProps<"a">

function PaginationLink({
    className,
    isActive,
    size = "icon",
    ...props
}: PaginationLinkProps) {
    return (
        <a
            aria-current={isActive ? "page" : undefined}
            data-slot="pagination-link"
            data-active={isActive}
            className={cn(
                "inline-flex items-center justify-center gap-1 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                size === "default" ? "h-9 px-3" : "size-9",
                isActive
                    ? "border border-input bg-background shadow-sm"
                    : "bg-transparent",
                className
            )}
            {...props}
        />
    )
}

function PaginationPrevious({
    className,
    text = "Previous",
    ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
    return (
        <PaginationLink
            aria-label="Go to previous page"
            size="default"
            className={cn("pl-1.5!", className)}
            {...props}
        >
            <ChevronLeftIcon className="size-4" />
            <span>{text}</span>
        </PaginationLink>
    )
}

function PaginationNext({
    className,
    text = "Next",
    ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
    return (
        <PaginationLink
            aria-label="Go to next page"
            size="default"
            className={cn("pr-1.5!", className)}
            {...props}
        >
            <span>{text}</span>
            <ChevronRightIcon className="size-4" />
        </PaginationLink>
    )
}

function PaginationEllipsis({
    className,
    ...props
}: React.ComponentProps<"span">) {
    return (
        <span
            aria-hidden
            data-slot="pagination-ellipsis"
            className={cn(
                "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
                className
            )}
            {...props}
        >
            <MoreHorizontalIcon />
            <span className="sr-only">More pages</span>
        </span>
    )
}

export {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
}
