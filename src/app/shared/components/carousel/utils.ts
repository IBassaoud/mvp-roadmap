export function saveLastViewedMonthIndex(boardId: string, index: number): void {
  localStorage.setItem(`lastViewedMonthIndex_${boardId}`, index.toString());
}

export function loadLastViewedMonthIndex(boardId: string): number | null {
  const index = localStorage.getItem(`lastViewedMonthIndex_${boardId}`);
  return index !== null ? parseInt(index, 10) : null;
}
