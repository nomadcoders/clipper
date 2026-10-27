import { Check, Clock3, X, type LucideIcon } from "lucide-react";

export type StatusStyle = {
  label: string;
  className: string;
  icon: LucideIcon;
};

const statusStyles: Record<string, StatusStyle> = {
  confirmed: {
    label: "Confirmed",
    className: "border-(--bd-bfe8db) bg-(--bg-e7f8f1) text-(--fg-08775d)",
    icon: Check,
  },
  completed: {
    label: "Completed",
    className: "border-(--bd-cbd8ff) bg-(--bg-eef1ff) text-(--fg-4353a3)",
    icon: Check,
  },
  cancelled: {
    label: "Cancelled",
    className: "border-(--bd-f3c4c0) bg-(--bg-fff0ef) text-(--fg-9f3f38)",
    icon: X,
  },
  pending: {
    label: "Pending",
    className: "border-(--bd-e4d5a3) bg-(--bg-fff8dc) text-(--fg-775d13)",
    icon: Clock3,
  },
};

const fallbackStyle: StatusStyle = {
  label: "Booked",
  className: "border-(--bd-cbd8ff) bg-(--bg-eef1ff) text-(--fg-4353a3)",
  icon: Check,
};

/** One place that maps an appointment status to its label, colors and icon. */
export function getStatusStyle(status: string | null | undefined): StatusStyle {
  return statusStyles[status ?? ""] ?? fallbackStyle;
}
