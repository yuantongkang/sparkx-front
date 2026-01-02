import React, { useRef, useEffect } from 'react';
import { Group } from 'react-konva';
import Konva from 'konva';
import { BaseElementProps } from '../../types/ElementProps';

export { type BaseElementProps }; // Re-export for compatibility if needed, but better to fix consumers.


/**
 * BaseElement handles common Konva element behaviors:
 * - Position (x, y)
 * - Rotation
 * - Selection handling (onClick/onTap)
 * - Dragging logic (onDragStart, onDragEnd)
 * - Transformation logic (via Transformer in parent, but this updates state)
 */
export const BaseElement: React.FC<BaseElementProps> = ({
  id,
  x,
  y,
  width, // Passed for reference, but children often handle their own sizing visually
  height,
  rotation,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDblClick,
  draggable = true,
  children
}) => {
  const groupRef = useRef<Konva.Group>(null);

  return (
    <Group
      ref={groupRef}
      id={id}
      x={x}
      y={y}
      width={width}
      height={height}
      rotation={rotation}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={onDblClick}
      onDblTap={onDblClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
          rotation: e.target.rotation(),
        });
        onDragEnd?.();
      }}
      onTransformEnd={(e) => {
        // This is usually handled by the Transformer attached to the node, 
        // but if we wrap everything in a Group, the transformer attaches to the Group.
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // Reset scale to 1 and adjust width/height
        node.scaleX(1);
        node.scaleY(1);
        
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(5, node.height() * scaleY),
          rotation: node.rotation(),
        });
      }}
    >
      {children}
    </Group>
  );
};
