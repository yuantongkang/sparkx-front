"use client";

import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import { useStore } from 'zustand';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

export default function HistoryControls() {
  // Use useStore to subscribe to the temporal store updates
  const { pastStates, futureStates, undo, redo } = useStore(useWorkspaceStore.temporal);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-1.5 flex items-center gap-1 z-50">
      <button 
        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        onClick={() => undo()}
        disabled={pastStates.length === 0}
        title={`撤销 (${pastStates.length})`}
      >
        <Undo2 size={20} />
      </button>
      <div className="w-px h-5 bg-gray-200 mx-1" />
      <button 
        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        onClick={() => redo()}
        disabled={futureStates.length === 0}
        title={`重做 (${futureStates.length})`}
      >
        <Redo2 size={20} />
      </button>
    </div>
  );
}
