import React from 'react';
import { ToolType } from './ToolType';

export interface BaseElementProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDblClick?: () => void;
  draggable?: boolean;
  children?: React.ReactNode;
}

export interface ShapeElementProps extends BaseElementProps {
  type: ToolType;
  color?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  cornerRadius?: number;
  sides?: number;
  starInnerRadius?: number;
}

export interface TextShapeElementProps extends BaseElementProps {
  color?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  cornerRadius?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  children?: React.ReactNode;
}
