import React from 'react';
import { Rect } from 'react-konva';
import ShapeTextElement, { ShapeTextElementProps } from './ShapeTextElement';

export default function MessageSquareTextElement(props: ShapeTextElementProps) {
  const { width, height, color = '#3b82f6', stroke, strokeWidth, strokeStyle, cornerRadius } = props;
  
  const dash = strokeStyle === 'dashed' ? [10, 5] : (strokeStyle === 'dotted' ? [2, 2] : undefined);

  return (
    <ShapeTextElement {...props}>
      <Rect
        width={width}
        height={height}
        fill={color}
        stroke={stroke}
        strokeWidth={strokeWidth}
        dash={dash}
        cornerRadius={cornerRadius !== undefined ? cornerRadius : 10}
      />
    </ShapeTextElement>
  );
}
