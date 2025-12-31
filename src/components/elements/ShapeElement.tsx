import React from 'react';
import { Rect, Ellipse, RegularPolygon, Star as KonvaStar, Path } from 'react-konva';
import { BaseElement, BaseElementProps } from './BaseElement';
import { ToolType } from '../ToolsPanel';

interface ShapeElementProps extends BaseElementProps {
  type: ToolType;
  color?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  cornerRadius?: number;
  sides?: number;
}

export default function ShapeElement(props: ShapeElementProps) {
  const { type, width, height, color = '#3b82f6', stroke, strokeWidth, strokeStyle, cornerRadius, sides, children } = props;

  const getDash = () => {
    switch (strokeStyle) {
      case 'dashed': return [10, 5];
      case 'dotted': return [2, 2];
      default: return undefined;
    }
  };

  const commonShapeProps = {
    fill: color,
    stroke: stroke,
    strokeWidth: strokeWidth,
    dash: getDash(),
  };

  const renderShape = () => {
    switch (type) {
      case 'rectangle':
        return (
          <Rect
            width={width}
            height={height}
            fill={color}
            stroke={stroke}
            strokeWidth={strokeWidth}
            dash={getDash()}
            cornerRadius={cornerRadius || 0}
          />
        );
      case 'circle':
        // Konva Circle uses radius, but our model uses width/height
        // We use Ellipse to support non-uniform scaling
        return (
          <Ellipse
            x={width / 2}
            y={height / 2}
            radiusX={width / 2}
            radiusY={height / 2}
            fill={color}
            stroke={stroke}
            strokeWidth={strokeWidth}
            dash={getDash()}
          />
        );
      case 'triangle': {
        // Use Path to create regular polygon with rounded corners (Triangle is just 3 sides)
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2;
        const numSides = Math.max(3, sides || 3);
        
        // Calculate polygon points
        const polygonPoints = [];
        for (let i = 0; i < numSides; i++) {
          const angle = (i * 2 * Math.PI / numSides) - Math.PI / 2; // Start from top
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          polygonPoints.push({ x, y });
        }
        
        // Create path with rounded corners
        let polygonPathData;
        if (cornerRadius > 0) {
          // Calculate max radius to prevent self-intersection
          // Max radius is roughly half the side length
          const sideLength = 2 * radius * Math.sin(Math.PI / numSides);
          const maxCornerRadius = sideLength / 2;
          const effectiveRadius = Math.min(cornerRadius, maxCornerRadius);
          
          // Calculate control points for rounded corners
          const pathCommands = [];
          for (let i = 0; i < numSides; i++) {
            const current = polygonPoints[i];
            const next = polygonPoints[(i + 1) % numSides];
            const prev = polygonPoints[(i + numSides - 1) % numSides];
            
            // Calculate vectors for corner rounding
            const distPrev = Math.sqrt((prev.x - current.x) ** 2 + (prev.y - current.y) ** 2);
            const distNext = Math.sqrt((next.x - current.x) ** 2 + (next.y - current.y) ** 2);
            
            const vec1 = { 
              x: (prev.x - current.x) / distPrev,
              y: (prev.y - current.y) / distPrev
            };
            const vec2 = { 
              x: (next.x - current.x) / distNext,
              y: (next.y - current.y) / distNext
            };
            
            // Calculate points for rounded corner
            const startPoint = {
              x: current.x + vec1.x * effectiveRadius,
              y: current.y + vec1.y * effectiveRadius
            };
            const endPoint = {
              x: current.x + vec2.x * effectiveRadius,
              y: current.y + vec2.y * effectiveRadius
            };
            
            if (i === 0) {
              pathCommands.push(`M ${startPoint.x} ${startPoint.y}`);
            }
            
            // Add line to start of arc
            pathCommands.push(`L ${startPoint.x} ${startPoint.y}`);
            
            // Add arc (using Q quadratic bezier for simple rounded corner or A arc command)
            // Using A command: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
            // For a regular polygon corner, we want a circular arc.
            // The sweep flag depends on winding order. Here we go clockwise (top -> right -> ...), so sweep flag 1.
            pathCommands.push(`A ${effectiveRadius} ${effectiveRadius} 0 0 1 ${endPoint.x} ${endPoint.y}`);
          }
          pathCommands.push('Z');
          polygonPathData = pathCommands.join(' ');
        } else {
          // Create sharp polygon path
          polygonPathData = `M ${polygonPoints[0].x} ${polygonPoints[0].y}`;
          for (let i = 1; i < numSides; i++) {
            polygonPathData += ` L ${polygonPoints[i].x} ${polygonPoints[i].y}`;
          }
          polygonPathData += ' Z';
        }
        
        return (
          <Path
            data={polygonPathData}
            fill={color}
            stroke={stroke}
            strokeWidth={strokeWidth}
            dash={getDash()}
          />
        );
      }
      case 'star': {
        // Use Path to create star with rounded corners
        const starCenterX = width / 2;
        const starCenterY = height / 2;
        const outerRadius = Math.min(width, height) / 2;
        const innerRadius = outerRadius / 2;
        
        // Calculate star points
        const starPoints = [];
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI / 5) - Math.PI / 2;
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const x = starCenterX + radius * Math.cos(angle);
          const y = starCenterY + radius * Math.sin(angle);
          starPoints.push({ x, y });
        }
        
        // Create path with rounded corners
        let starPathData;
        if (cornerRadius > 0) {
          // Create rounded star path using arcs
          const effectiveRadius = Math.min(cornerRadius, outerRadius * 0.2);
          
          const pathCommands = [];
          for (let i = 0; i < 10; i++) {
            const current = starPoints[i];
            const next = starPoints[(i + 1) % 10];
            const prev = starPoints[(i + 9) % 10];
            
            // Calculate vectors for corner rounding
            const vec1 = { 
              x: (prev.x - current.x) / Math.sqrt((prev.x - current.x) ** 2 + (prev.y - current.y) ** 2),
              y: (prev.y - current.y) / Math.sqrt((prev.x - current.x) ** 2 + (prev.y - current.y) ** 2)
            };
            const vec2 = { 
              x: (next.x - current.x) / Math.sqrt((next.x - current.x) ** 2 + (next.y - current.y) ** 2),
              y: (next.y - current.y) / Math.sqrt((next.x - current.x) ** 2 + (next.y - current.y) ** 2)
            };
            
            // Calculate points for rounded corner
            const startPoint = {
              x: current.x + vec1.x * effectiveRadius,
              y: current.y + vec1.y * effectiveRadius
            };
            const endPoint = {
              x: current.x + vec2.x * effectiveRadius,
              y: current.y + vec2.y * effectiveRadius
            };
            
            if (i === 0) {
              pathCommands.push(`M ${startPoint.x} ${startPoint.y}`);
            }
            
            // Add line to start of arc
            pathCommands.push(`L ${startPoint.x} ${startPoint.y}`);
            
            // Add arc
            pathCommands.push(`A ${effectiveRadius} ${effectiveRadius} 0 0 1 ${endPoint.x} ${endPoint.y}`);
          }
          pathCommands.push('Z');
          starPathData = pathCommands.join(' ');
        } else {
          // Create sharp star path
          starPathData = `M ${starPoints[0].x} ${starPoints[0].y}`;
          for (let i = 1; i < 10; i++) {
            starPathData += ` L ${starPoints[i].x} ${starPoints[i].y}`;
          }
          starPathData += ' Z';
        }
        
        return (
          <Path
            data={starPathData}
            fill={color}
            stroke={stroke}
            strokeWidth={strokeWidth}
            dash={getDash()}
          />
        );
      }
      default:
        return (
          <Rect 
            width={width} 
            height={height} 
            fill={color}
            stroke={stroke}
            strokeWidth={strokeWidth}
            dash={getDash()}
            cornerRadius={cornerRadius || 0} 
          />
        );
    }
  };

  return (
    <BaseElement {...props}>
      {renderShape()}
      {children}
    </BaseElement>
  );
}
