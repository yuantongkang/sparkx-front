"use client";

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import CanvasArea from './CanvasArea';
import RightPanel from './RightPanel';
import { BaseElement, ElementFactory } from '../models/BaseElement';

export default function AssetsEditor() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

  // Centralized State
  const [elements, setElements] = useState<BaseElement[]>([
    ElementFactory.createDefault('image', 100, 100, 'initial-img')
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleRightPanel = () => {
    setIsRightPanelCollapsed(!isRightPanelCollapsed);
  };

  const handleLayerSelect = (id: string | null) => {
    setSelectedId(id);
  };

  return (
    <div className="flex h-screen w-full bg-gray-50">
      <div className={`transition-all duration-300 flex-shrink-0 ${isSidebarCollapsed ? 'w-0 p-0' : 'w-auto p-4 h-full'}`}>
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          toggleSidebar={toggleSidebar}
          elements={elements}
          selectedId={selectedId}
          onSelect={handleLayerSelect}
        />
      </div>
      
      <div className="flex flex-1 flex-col bg-gray-50 overflow-hidden relative">
        <CanvasArea 
          isSidebarCollapsed={isSidebarCollapsed}
          elements={elements}
          onElementsChange={setElements}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      <div className={`transition-all duration-300 ${isRightPanelCollapsed ? 'w-0 p-0' : 'w-auto p-4 h-full'}`}>
        <RightPanel isCollapsed={isRightPanelCollapsed} togglePanel={toggleRightPanel} />
      </div>
    </div>
  );
}
