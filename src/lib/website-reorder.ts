/** Move a site to a 1-based search rank within the global website list. */
export function moveWebsiteToRank(allIds: string[], siteId: string, targetRank: number): string[] {
  if (allIds.length === 0) return allIds;

  const currentIndex = allIds.indexOf(siteId);
  if (currentIndex === -1) return allIds;

  const targetIndex = Math.max(0, Math.min(Math.floor(targetRank) - 1, allIds.length - 1));
  if (currentIndex === targetIndex) return allIds;

  const result = [...allIds];
  const [moved] = result.splice(currentIndex, 1);
  result.splice(targetIndex, 0, moved);
  return result;
}
