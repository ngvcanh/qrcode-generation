import { createStore, PayloadAction } from "@/lib/store";

export interface GenerationMetric {
  id: string;
  renderTime: number;
  memoryUsage: number;
  fileSize: number;
  timestamp: number;
  value: string;
  size: number;
  logo?: string | null;
  dataURL?: string; // Store the generated QR code as data URL
}

export interface AggregatedMetrics {
  totalGenerations: number;
  averageRenderTime: number;
  minRenderTime: number;
  maxRenderTime: number;
  totalMemoryUsage: number;
  averageMemoryUsage: number;
  lastGeneration: GenerationMetric | null;
}

interface MetrictStack {
  stack: GenerationMetric[];
  metrics: AggregatedMetrics;
}

export interface QRStyleSettings {
  dotStyle: 'square' | 'circle' | 'rounded' | 'dots' | 'star' | 'diamond';
  cornerStyle: 'square' | 'circle' | 'rounded';
  backgroundColor: string;
  foregroundColor: string;
  logoStyle: 'square' | 'circle' | 'rounded';
  margin: number;
}

export interface QRCodeState {
  value: string;
  size: number;
  iterations: number;
  logo: string | null; // Base64 logo string
  stacks: Record<string, MetrictStack>;
  currentId: string;
  styleSettings: QRStyleSettings;
}

const initialState: QRCodeState = {
  value: "https://github.com/ngvcanh/qrcode-generation",
  size: 240,
  iterations: 20,
  logo: null,
  stacks: {},
  currentId: "",
  styleSettings: {
    dotStyle: 'square',
    cornerStyle: 'square',
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    logoStyle: 'rounded',
    margin: 4,
  },
};

function calculateMetrics(stack: GenerationMetric[]): AggregatedMetrics {
  const totalGenerations = stack.length;
  const totalRenderTime = stack.reduce((sum, metric) => sum + metric.renderTime, 0);
  const totalMemoryUsage = stack.reduce((sum, metric) => sum + metric.memoryUsage, 0);
  const averageRenderTime = totalGenerations ? totalRenderTime / totalGenerations : 0;
  const averageMemoryUsage = totalGenerations ? totalMemoryUsage / totalGenerations : 0;
  const minRenderTime = totalGenerations ? Math.min(...stack.map(metric => metric.renderTime)) : 0;
  const maxRenderTime = totalGenerations ? Math.max(...stack.map(metric => metric.renderTime)) : 0;
  const lastGeneration = totalGenerations ? stack[totalGenerations - 1] : null;
  return {
    totalGenerations,
    averageRenderTime,
    minRenderTime,
    maxRenderTime,
    totalMemoryUsage,
    averageMemoryUsage,
    lastGeneration,
  };
}

const QRCodeStore = createStore({
  name: "QRCodeStore",
  initialState,
  reducers: {
    setValue: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
    setSize: (state, action: PayloadAction<number>) => {
      state.size = action.payload;
    },
    addMetric(state, action: PayloadAction<GenerationMetric, string, string>) {
      const current = state.stacks[action.meta] || {
        stack: [],
        metrics: {
          totalGenerations: 0,
          averageRenderTime: 0,
          minRenderTime: 0,
          maxRenderTime: 0,
          totalMemoryUsage: 0,
          averageMemoryUsage: 0,
          lastGeneration: null,
        },
      };

      current.stack.push(action.payload);
      current.metrics = calculateMetrics(current.stack);

      state.stacks[action.meta] = current;
    },
    setCurrentId(state, action: PayloadAction<string>) {
      state.currentId = action.payload;
    },
    setIterations: (state, action: PayloadAction<number>) => {
      state.iterations = action.payload;
    },
    setLogo: (state, action: PayloadAction<string | null>) => {
      state.logo = action.payload;
    },
    setStyleSettings: (state, action: PayloadAction<QRStyleSettings>) => {
      state.styleSettings = action.payload;
    },
  },
});

export const QRCodeProvider = QRCodeStore.Provider;
export const useQRCode = QRCodeStore.useStore;
