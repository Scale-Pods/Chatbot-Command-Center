export function getSummaryText(summary: string | null | undefined): string {
  if (!summary) {
    return "No summary available for this conversation."
  }
  return summary
}
