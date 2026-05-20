export interface RecordingMetadata {
  id: string;
  lyricLineId: number;
  lyricText: string;
  duration: number;
  timestamp: Date;
  blobUrl: string;
  mimeType: string;
}

export interface RecordingAnalysis {
  recordingId: string;
  pronunciation: number;
  smoothness: number;
  rhythm: number;
  connectedSpeech: number;
  vibe: string;
  vibeFeedback: string;
  chineseExplanation: string;
  singingTip: string;
  tags: string[];
  analyzedAt: Date;
}

export interface AnalyzeRecordingInput {
  recordingBlob: Blob;
  metadata: RecordingMetadata;
}

export interface AnalyzeRecordingOutput {
  success: boolean;
  analysis?: RecordingAnalysis;
  error?: string;
}

export interface RecordingSession {
  recordings: RecordingMetadata[];
  analyses: Map<string, RecordingAnalysis>;
  addRecording: (blob: Blob, metadata: Omit<RecordingMetadata, 'id' | 'blobUrl' | 'timestamp'>) => RecordingMetadata;
  getRecording: (id: string) => RecordingMetadata | undefined;
  getAnalysis: (recordingId: string) => RecordingAnalysis | undefined;
  deleteRecording: (id: string) => void;
  clearAll: () => void;
}
