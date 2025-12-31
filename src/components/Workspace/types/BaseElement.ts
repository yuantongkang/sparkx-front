import { ToolType } from './ToolType';

export interface IElementState {
  id: string;
  type: ToolType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  visible: boolean;
  locked: boolean;
  color?: string;
  src?: string; // For images
  text?: string; // For text and shape-text
  fontSize?: number; // For text
  fontFamily?: string; // For text
  textColor?: string; // For text
  stroke?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  cornerRadius?: number;
  sides?: number; // For polygon sides
  starInnerRadius?: number; // For star inner radius percentage (0-100)
}

export abstract class BaseElement {
  id: string;
  type: ToolType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  visible: boolean;
  locked: boolean;

  constructor(state: IElementState) {
    this.id = state.id;
    this.type = state.type;
    this.name = state.name;
    this.x = state.x;
    this.y = state.y;
    this.width = state.width;
    this.height = state.height;
    this.rotation = state.rotation;
    this.visible = state.visible;
    this.locked = state.locked;
  }

  // 返回一个新的实例以保持不可变性
  abstract clone(): BaseElement;
  
  update(props: Partial<IElementState>): BaseElement {
    const newState = { ...this.toState(), ...props };
    return ElementFactory.create(newState);
  }

  toState(): IElementState {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      rotation: this.rotation,
      visible: this.visible,
      locked: this.locked,
    };
  }
}

export class ShapeElement extends BaseElement {
  color: string;
  stroke?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  cornerRadius?: number;
  sides?: number;
  starInnerRadius?: number;

  constructor(state: IElementState) {
    super(state);
    this.color = state.color || '#3b82f6';
    this.stroke = state.stroke;
    this.strokeWidth = state.strokeWidth;
    this.strokeStyle = state.strokeStyle;
    this.cornerRadius = state.cornerRadius;
    this.sides = state.sides;
    this.starInnerRadius = state.starInnerRadius;
  }

  clone(): ShapeElement {
    return new ShapeElement(this.toState());
  }

  toState(): IElementState {
    return {
      ...super.toState(),
      color: this.color,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
      strokeStyle: this.strokeStyle,
      cornerRadius: this.cornerRadius,
      sides: this.sides,
      starInnerRadius: this.starInnerRadius,
    };
  }
}

export class ImageElement extends BaseElement {
  src: string;

  constructor(state: IElementState) {
    super(state);
    this.src = state.src || '';
  }

  clone(): ImageElement {
    return new ImageElement(this.toState());
  }

  toState(): IElementState {
    return {
      ...super.toState(),
      src: this.src,
    };
  }
}

export class TextElement extends BaseElement {
  text: string;
  fontSize: number;
  fontFamily: string;
  textColor: string;

  constructor(state: IElementState) {
    super(state);
    this.text = state.text !== undefined ? state.text : 'Double click to edit';
    this.fontSize = state.fontSize || 20;
    this.fontFamily = state.fontFamily || 'Arial';
    this.textColor = state.textColor || '#000000';
  }

  clone(): TextElement {
    return new TextElement(this.toState());
  }

  toState(): IElementState {
    return {
      ...super.toState(),
      text: this.text,
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      textColor: this.textColor,
    };
  }
}

export class TextShapeElement extends ShapeElement {
  text: string;
  fontSize: number;
  fontFamily: string;
  textColor: string;

  constructor(state: IElementState) {
    super(state);
    this.text = state.text !== undefined ? state.text : 'Text';
    this.fontSize = state.fontSize || 14;
    this.fontFamily = state.fontFamily || 'Arial';
    this.textColor = state.textColor || '#ffffff';
  }

  clone(): TextShapeElement {
    return new TextShapeElement(this.toState());
  }

  toState(): IElementState {
    return {
      ...super.toState(),
      text: this.text,
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      textColor: this.textColor,
    };
  }
}

export class ElementFactory {
  static create(state: IElementState): BaseElement {
    if (state.type === 'image') {
      return new ImageElement(state);
    } else if (state.type === 'text') {
      return new TextElement(state);
    } else if (['message-square', 'arrow-left', 'arrow-right', 'rectangle-text', 'circle-text'].includes(state.type)) {
       return new TextShapeElement(state);
    }
    return new ShapeElement(state);
  }

  static createDefault(type: ToolType, x: number, y: number, id?: string): BaseElement {
    const finalId = id || Date.now().toString();
    const baseState: IElementState = {
      id: finalId,
      type,
      name: `${type} ${finalId.slice(-4)}`,
      x,
      y,
      width: 100,
      height: 100,
      rotation: 0,
      visible: true,
      locked: false,
    };

    if (type === 'image') {
       return new ImageElement({ ...baseState, src: '/role.png', width: 200, height: 300 });
    }
    
    if (type === 'text') {
      return new TextElement({
        ...baseState,
        width: 200,
        height: 50,
        text: 'Hello World'
      });
    }

    if (['message-square', 'arrow-left', 'arrow-right', 'rectangle-text', 'circle-text'].includes(type)) {
       return new TextShapeElement({
         ...baseState,
         color: '#8b5cf6',
         text: 'Label',
         textColor: '#ffffff'
       });
    }

    // 根据类型分配默认颜色
    let color = '#3b82f6';
    if (type === 'circle') color = '#ef4444';
    if (type === 'triangle') color = '#10b981';
    if (type === 'star') color = '#f59e0b';

    return new ShapeElement({ ...baseState, color, sides: type === 'star' ? 5 : (type === 'triangle' ? 3 : undefined), starInnerRadius: type === 'star' ? 50 : undefined });
  }
}
