import { useRef, useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Website } from '@/types';
import { moveWebsiteToRank } from '@/lib/website-reorder';

const DRAG_INDEX_KEY = 'application/x-website-index';

function sortByPriority(websites: Website[]) {
  return [...websites].sort((a, b) => b.priority - a.priority);
}

export function useWebsiteReorder(token: string | null, websites: Website[] | undefined) {
  const queryClient = useQueryClient();
  const dragIndexRef = useRef<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const res = await fetch('/api/websites/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderedIds }),
      });
      if (!res.ok) throw new Error('Failed to reorder');
      return res.json() as Promise<Website[]>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['admin-websites'], sortByPriority(data));
    },
  });

  const mergeReorder = useCallback(
    (displayed: Website[], fromIndex: number, toIndex: number) => {
      if (!websites || fromIndex === toIndex) return;
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= displayed.length || toIndex >= displayed.length) {
        return;
      }

      const allIds = websites.map((w) => w.id);
      const filteredIds = displayed.map((w) => w.id);
      const filterPositions: number[] = [];
      const filterIdOrder: string[] = [];

      allIds.forEach((id, i) => {
        if (filteredIds.includes(id)) {
          filterPositions.push(i);
          filterIdOrder.push(id);
        }
      });

      const newFilterOrder = [...filterIdOrder];
      const [moved] = newFilterOrder.splice(fromIndex, 1);
      newFilterOrder.splice(toIndex, 0, moved);

      const result = [...allIds];
      filterPositions.forEach((pos, i) => {
        result[pos] = newFilterOrder[i];
      });

      reorderMutation.mutate(result);
    },
    [websites, reorderMutation]
  );

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragIndexRef.current = index;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(DRAG_INDEX_KEY, String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverIndex(index);
  };

  const handleDrop = (displayed: Website[], index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const fromData = e.dataTransfer.getData(DRAG_INDEX_KEY);
    const from =
      dragIndexRef.current ??
      (fromData !== '' ? parseInt(fromData, 10) : Number.NaN);

    if (Number.isFinite(from)) {
      mergeReorder(displayed, from, index);
    }

    dragIndexRef.current = null;
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDragIndex(null);
    setOverIndex(null);
  };

  const placeAtRank = (siteId: string, targetRank: number) => {
    if (!websites) return;
    reorderMutation.mutate(moveWebsiteToRank(websites.map((w) => w.id), siteId, targetRank));
  };

  const getGlobalRank = (siteId: string) => {
    if (!websites) return 1;
    const idx = websites.findIndex((w) => w.id === siteId);
    return idx === -1 ? 1 : idx + 1;
  };

  return {
    dragIndex,
    overIndex,
    reorderMutation,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    placeAtRank,
    getGlobalRank,
  };
}
