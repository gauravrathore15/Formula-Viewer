
export enum InputMode {
  TEXT = 'text',
  IMAGE = 'image',
  DRAW = 'draw',
}

export interface ImageData {
  base64: string;
  mimeType: string;
}
