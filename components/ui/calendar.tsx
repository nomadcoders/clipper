"use client";

import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { DayPicker, type DayPickerProps } from "react-day-picker";

import { cn } from "@/lib/utils";

function Calendar({ className, classNames, ...props }: DayPickerProps) {
  return (
    <DayPicker
      showOutsideDays
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous:
          "absolute left-1 size-7 rounded-md bg-transparent p-0 opacity-50 hover:bg-accent hover:opacity-100",
        button_next:
          "absolute right-1 size-7 rounded-md bg-transparent p-0 opacity-50 hover:bg-accent hover:opacity-100",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "w-8 rounded-md text-[0.8rem] font-normal text-muted-foreground",
        week: "mt-2 flex w-full",
        day: "relative size-8 p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button:
          "size-8 rounded-md p-0 font-normal aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:opacity-100",
        today: "bg-accent text-accent-foreground",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...chevronProps }) => {
          const Icon =
            orientation === "left"
              ? ChevronLeft
              : orientation === "right"
                ? ChevronRight
                : orientation === "up"
                  ? ChevronUp
                  : ChevronDown;

          return (
            <Icon
              className={cn("size-4", chevronClassName)}
              {...chevronProps}
            />
          );
        },
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
