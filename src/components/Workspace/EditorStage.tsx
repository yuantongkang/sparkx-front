"use client";

import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Transformer } from 'react-konva';
import ImageElement from './elements/ImageElement';
import ShapeElement from './elements/ShapeElement';
import TextElement from './elements/TextElement';
import TextRectangleElement from './elements/TextRectangleElement';
import TextCircleElement from './elements/TextCircleElement';
import TextMessageSquareElement from './elements/TextMessageSquareElement';
import TextArrowLeftElement from './elements/TextArrowLeftElement';
import TextArrowRightElement from './elements/TextArrowRightElement';
import { ToolType } from './ToolsPanel';
import Konva from 'konva';
import { 
  BaseElement as BaseElementModel, 
  ElementFactory, 
  ShapeElement as ShapeElementModel, 
  ImageElement as ImageElementModel, 
  TextElement as TextElementModel, 
  TextShapeElement as TextShapeElementModel 
} from '../../models/BaseElement';

interface EditorStageProps {
  elements: BaseElementModel[];
  onElementsChange: (elements: BaseElementModel[]) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  activeTool: ToolType;
  onToolUsed: () => void;
  zoom: number;
  stagePos?: { x: number, y: number };
  onStagePosChange?: (pos: { x: number, y: number }) => void;
  width: number;
  height: number;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onToolChange?: (tool: ToolType) => void;
}

export default function EditorStage({
  elements,
  onElementsChange,
  selectedId,
  onSelect,
  activeTool,
  onToolUsed,
  zoom,
  stagePos = { x: 0, y: 0 },
  onStagePosChange,
  width,
  height,
  onDragStart,
  onDragEnd,
  onToolChange,
}: EditorStageProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const [isDrawing, setIsDrawing] = React.useState(false);
  const [drawStartPos, setDrawStartPos] = React.useState({ x: 0, y: 0 });
  const [previewElement, setPreviewElement] = React.useState<BaseElementModel | null>(null);

  // Handle stage position updates (centering)
  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.position(stagePos);
      stageRef.current.batchDraw();
    }
  }, [stagePos]);

  // Update cursor based on tool
  useEffect(() => {
    if (stageRef.current) {
      if (activeTool === 'hand') {
        stageRef.current.container().style.cursor = 'grab';
      } else {
        stageRef.current.container().style.cursor = 'default';
      }
    }
  }, [activeTool]);

  // Handle selection transformer
  useEffect(() => {
    if (selectedId && transformerRef.current && stageRef.current && !isDrawing) {
      const selectedNode = stageRef.current.findOne('#' + selectedId);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      } else {
        transformerRef.current.nodes([]);
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedId, elements, isDrawing]);

  const getStagePos = (stage: Konva.Stage, pointerPosition: { x: number, y: number }) => {
    return {
      x: (pointerPosition.x - stage.x()) / stage.scaleX(),
      y: (pointerPosition.y - stage.y()) / stage.scaleY(),
    };
  };

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // If clicked on empty area - remove all selections
    if (e.target === e.target.getStage()) {
      if (activeTool === 'select') {
        onSelect(null);
        return;
      }

      // Start drawing new element
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;

      const { x, y } = getStagePos(stage, pointerPosition);

      if (['rectangle', 'circle', 'triangle', 'star', 'message-square', 'arrow-left', 'arrow-right', 'rectangle-text', 'circle-text', 'text', 'image'].includes(activeTool)) {
         setIsDrawing(true);
         setDrawStartPos({ x, y });
         // Create a temporary element with 0 size
         const newEl = ElementFactory.createDefault(activeTool, x, y);
         newEl.width = 0;
         newEl.height = 0;
         setPreviewElement(newEl);
         
         // Deselect current
         onSelect(null);
      }
      return;
    }

    // If clicked on an element
    if (activeTool === 'select') {
      const clickedId = e.target.id() || e.target.getParent()?.id();
      if (clickedId) {
        onSelect(clickedId);
      }
    }
  };

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !previewElement) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    const { x, y } = getStagePos(stage, pointerPosition);

    const width = Math.abs(x - drawStartPos.x);
    const height = Math.abs(y - drawStartPos.y);
    const newX = Math.min(x, drawStartPos.x);
    const newY = Math.min(y, drawStartPos.y);

    const updatedPreview = previewElement.update({
      x: newX,
      y: newY,
      width: width,
      height: height
    });

    setPreviewElement(updatedPreview);
  };

  const handleStageMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !previewElement) return;

    const stage = e.target.getStage();
    if (!stage) {
       setIsDrawing(false);
       setPreviewElement(null);
       return;
    }

    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) {
       setIsDrawing(false);
       setPreviewElement(null);
       return;
    }

    const { x, y } = getStagePos(stage, pointerPosition);
    
    // Calculate diagonal distance
    const dx = x - drawStartPos.x;
    const dy = y - drawStartPos.y;
    const diagonal = Math.sqrt(dx * dx + dy * dy);

    let finalElement = previewElement;

    // Threshold for click vs drag (e.g. 10 pixels)
    if (diagonal < 10) {
       // If it's a click on empty area and we are in a drawing mode, 
       // reset to select tool instead of creating a default element.
       if (activeTool !== 'select') {
          setIsDrawing(false);
          setPreviewElement(null);
          onToolChange?.('select');
          return;
       }

       // The following code is unreachable because of the check above.
       // It seems like click-to-create was intended but disabled.
       // Commenting out to satisfy TypeScript.
       
       /*
       // Create default size element centered at click or top-left at click
       const defaultX = activeTool === 'image' ? drawStartPos.x - 100 : drawStartPos.x - 50;
       const defaultY = activeTool === 'image' ? drawStartPos.y - 100 : drawStartPos.y - 50;
       
       finalElement = ElementFactory.createDefault(activeTool, defaultX, defaultY);
       */
    }

    onElementsChange([...elements, finalElement]);
    onSelect(finalElement.id);
    onToolUsed();
    
    setIsDrawing(false);
    setPreviewElement(null);
  };

  const handleElementChange = (id: string, newAttrs: any) => {
    const updatedElements = elements.map((el) => {
      if (el.id === id) {
        return el.update(newAttrs);
      }
      return el;
    });
    onElementsChange(updatedElements);
  };

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      scaleX={zoom}
      scaleY={zoom}
      x={stagePos.x}
      y={stagePos.y}
      draggable={activeTool === 'hand'}
      onDragStart={() => {
        if (activeTool === 'hand') {
          if (stageRef.current) stageRef.current.container().style.cursor = 'grabbing';
          onDragStart?.();
        }
      }}
      onDragEnd={(e) => {
        if (activeTool === 'hand') {
          if (stageRef.current) stageRef.current.container().style.cursor = 'grab';
          onStagePosChange?.({ x: e.target.x(), y: e.target.y() });
          onDragEnd?.();
        }
      }}
      onMouseDown={handleStageMouseDown}
      onTouchStart={handleStageMouseDown as any}
      onMouseMove={handleStageMouseMove}
      onTouchMove={handleStageMouseMove as any}
      onMouseUp={handleStageMouseUp}
      onTouchEnd={handleStageMouseUp as any}
      className="bg-[#fafafa]"
    >
      <Layer>
        {[...elements, ...(previewElement ? [previewElement] : [])].map((el) => {
          if (!el.visible) return null;
          
          const commonProps = {
            key: el.id,
            id: el.id,
            x: el.x,
            y: el.y,
            width: el.width,
            height: el.height,
            rotation: el.rotation,
            isSelected: selectedId === el.id,
            onSelect: () => activeTool === 'select' && onSelect(el.id),
            onChange: (attrs: any) => handleElementChange(el.id, attrs),
            onDragStart: onDragStart,
            onDragEnd: onDragEnd,
            draggable: activeTool === 'select',
          };

          if (el.type === 'image') {
            return (
              <ImageElement
                {...commonProps}
                src={(el as ImageElementModel).src}
              />
            );
          } else if (el.type === 'text') {
             return (
               <TextElement
                  {...commonProps}
                  text={(el as TextElementModel).text}
                  fontSize={(el as TextElementModel).fontSize}
                  fontFamily={(el as TextElementModel).fontFamily}
                  fill={(el as TextElementModel).textColor}
               />
             );
          } else if (['message-square', 'arrow-left', 'arrow-right', 'rectangle-text', 'circle-text'].includes(el.type)) {
             // Shape Text Elements
             const shapeTextProps = {
                ...commonProps,
                color: (el as TextShapeElementModel).color,
                stroke: (el as TextShapeElementModel).stroke,
                strokeWidth: (el as TextShapeElementModel).strokeWidth,
                strokeStyle: (el as TextShapeElementModel).strokeStyle,
                cornerRadius: (el as TextShapeElementModel).cornerRadius,
                text: (el as TextShapeElementModel).text,
                fontSize: (el as TextShapeElementModel).fontSize,
                fontFamily: (el as TextShapeElementModel).fontFamily,
                textColor: (el as TextShapeElementModel).textColor,
             };

             switch (el.type) {
               case 'rectangle-text':
                 return <TextRectangleElement {...shapeTextProps} />;
               case 'circle-text':
                 return <TextCircleElement {...shapeTextProps} />;
               case 'message-square':
                 return <TextMessageSquareElement {...shapeTextProps} />;
               case 'arrow-left':
                 return <TextArrowLeftElement {...shapeTextProps} />;
               case 'arrow-right':
                 return <TextArrowRightElement {...shapeTextProps} />;
               default:
                 return null;
             }
          } else if (['rectangle', 'circle', 'triangle', 'star'].includes(el.type)) {
            return (
              <ShapeElement
                {...commonProps}
                type={el.type}
                color={(el as ShapeElementModel).color}
                stroke={(el as ShapeElementModel).stroke}
                strokeWidth={(el as ShapeElementModel).strokeWidth}
                strokeStyle={(el as ShapeElementModel).strokeStyle}
                cornerRadius={(el as ShapeElementModel).cornerRadius}
                sides={(el as ShapeElementModel).sides}
                starInnerRadius={(el as ShapeElementModel).starInnerRadius}
              />
            );
          }
          return null;
        })}
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      </Layer>
    </Stage>
  );
}
