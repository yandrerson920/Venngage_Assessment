export interface GenerationRequest {
  prompt: string;
  style: string;
  colors?: string[];
}

export interface Icon {
  id: number;
  url: string;
  prompt: string;
}

export interface GenerationResponse {
  success: boolean;
  icons: Icon[];
  metadata: {
    prompt: string;
    style: string;
    colors?: string[];
    count: number;
  };
}

export type PresetStyle = 'sticker' | 'pastels' | 'business' | 'cartoon' | '3d-model' | 'gradient';
