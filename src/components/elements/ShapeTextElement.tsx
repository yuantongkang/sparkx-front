import React, { useState, useRef, useEffect } from 'react';
import { Text as KonvaText } from 'react-konva';
import { Html } from 'react-konva-utils';
import { BaseElement, BaseElementProps } from './BaseElement';
import { ToolType } from '../ToolsPanel';

export interface ShapeTextElementProps extends BaseElementProps {
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

export default function ShapeTextElement(props: ShapeTextElementProps) {
  const { 
    width, 
    height, 
    text = '', 
    fontSize = 14, 
    fontFamily = 'Arial', 
    textColor = '#ffffff',
    onChange,
    children
  } = props;

  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleDblClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ text: e.target.value });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation(); 
  };

  const handleShapeChange = (newAttrs: any) => {
    if (newAttrs.height && height) {
      const scaleY = newAttrs.height / height;
      if (scaleY > 0 && Math.abs(scaleY - 1) > 0.001) {
        newAttrs.fontSize = Math.max(5, Math.round(fontSize * scaleY));
      }
    }
    onChange(newAttrs);
  };

  return (
    <BaseElement {...props} onDblClick={handleDblClick} onChange={handleShapeChange}>
       {children}
       <KonvaText
          text={text}
          fontSize={fontSize}
          fontFamily={fontFamily}
          fill={textColor}
          width={width}
          height={height}
          align="center"
          verticalAlign="middle"
          offsetX={0} 
          offsetY={0}
          listening={false} 
          visible={!isEditing}
       />
       {isEditing && (
          <Html>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              style={{
                width: width,
                height: height,
                position: 'absolute',
                top: 0,
                left: 0,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                color: textColor,
                fontSize: `${fontSize}px`,
                fontFamily: fontFamily,
                textAlign: 'center',
                lineHeight: 'normal',
                paddingTop: height ? (height - (fontSize || 14)) / 2 + 'px' : '0px',
                // This centering is approximate
              }}
            />
          </Html>
       )}
    </BaseElement>
  );
}
