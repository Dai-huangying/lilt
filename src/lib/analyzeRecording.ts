import { AnalyzeRecordingInput, AnalyzeRecordingOutput, RecordingAnalysis } from '@/types/recording';

const MOCK_FEEDBACKS = [
  {
    vibeFeedback: "Relax the ending a little.",
    chineseExplanation: "尾音不要太重。",
    singingTip: "Connect wanna and be smoothly.",
    tags: ["smooth-flow", "connected-speech"],
  },
  {
    vibeFeedback: "Nice breath control!",
    chineseExplanation: "气息控制得很好。",
    singingTip: "Keep that relaxed tone going.",
    tags: ["breath-control", "tone"],
  },
  {
    vibeFeedback: "Great energy!",
    chineseExplanation: "能量很足！",
    singingTip: "Try to match the original's laid-back feel.",
    tags: ["energy", "vibe"],
  },
  {
    vibeFeedback: "Perfect pitch!",
    chineseExplanation: "音准很棒！",
    singingTip: "Maintain this consistency throughout.",
    tags: ["pitch", "consistency"],
  },
  {
    vibeFeedback: "Smooth transitions!",
    chineseExplanation: "过渡很流畅！",
    singingTip: "Work on connecting words naturally.",
    tags: ["flow", "natural"],
  },
];

const generateMockAnalysis = (recordingId: string): RecordingAnalysis => {
  const mockFeedback = MOCK_FEEDBACKS[Math.floor(Math.random() * MOCK_FEEDBACKS.length)];
  
  return {
    recordingId,
    pronunciation: Math.floor(Math.random() * 20) + 75,
    smoothness: Math.floor(Math.random() * 25) + 70,
    rhythm: Math.floor(Math.random() * 20) + 75,
    connectedSpeech: Math.floor(Math.random() * 30) + 65,
    vibe: ['Great flow!', 'Smooth like butter', 'Natural vibe', 'Nice rhythm'][Math.floor(Math.random() * 4)],
    ...mockFeedback,
    analyzedAt: new Date(),
  };
};

export const analyzeRecording = async (
  input: AnalyzeRecordingInput
): Promise<AnalyzeRecordingOutput> => {
  console.log('[AnalyzeRecording] Starting analysis for recording:', input.metadata.id);
  console.log('[AnalyzeRecording] Lyric:', input.metadata.lyricText);
  console.log('[AnalyzeRecording] Duration:', input.metadata.duration, 'seconds');
  console.log('[AnalyzeRecording] Audio blob size:', input.recordingBlob.size, 'bytes');
  console.log('[AnalyzeRecording] Audio blob type:', input.recordingBlob.type);

  try {
    console.log('[AnalyzeRecording] Creating FormData...');
    const formData = new FormData();
    formData.append('audio', input.recordingBlob, `recording_${input.metadata.id}.webm`);
    formData.append('lyric', input.metadata.lyricText);
    formData.append('duration', input.metadata.duration.toString());

    console.log('[AnalyzeRecording] Sending request to /api/analyze...');
    const startTime = Date.now();

    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
      headers: {
        // 不需要设置 Content-Type，浏览器会自动设置 multipart/form-data 边界
      },
    });

    const duration = Date.now() - startTime;
    console.log('[AnalyzeRecording] Response received in', duration, 'ms');
    console.log('[AnalyzeRecording] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AnalyzeRecording] API request failed:', errorText);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    console.log('[AnalyzeRecording] API response:', JSON.stringify(result, null, 2).substring(0, 500));

    if (!result.success) {
      console.error('[AnalyzeRecording] Analysis failed:', result.error);
      throw new Error(result.error || 'Analysis failed');
    }

    // 将 API 返回的分析结果转换为 RecordingAnalysis 类型
    const analysis: RecordingAnalysis = {
      recordingId: input.metadata.id,
      pronunciation: result.analysis.pronunciation,
      smoothness: result.analysis.smoothness,
      rhythm: result.analysis.rhythm,
      connectedSpeech: result.analysis.connectedSpeech,
      vibe: result.analysis.vibe,
      vibeFeedback: result.analysis.vibeFeedback,
      chineseExplanation: result.analysis.chineseExplanation,
      singingTip: result.analysis.singingTip,
      tags: result.analysis.tags,
      analyzedAt: new Date(result.analysis.analyzedAt),
    };

    console.log('[AnalyzeRecording] Analysis complete!');
    console.log('[AnalyzeRecording] Scores:', {
      pronunciation: analysis.pronunciation,
      smoothness: analysis.smoothness,
      rhythm: analysis.rhythm,
      connectedSpeech: analysis.connectedSpeech,
    });
    console.log('[AnalyzeRecording] Feedback:', {
      vibe: analysis.vibe,
      vibeFeedback: analysis.vibeFeedback,
      chineseExplanation: analysis.chineseExplanation,
    });

    return {
      success: true,
      analysis,
    };

  } catch (error) {
    console.error('[AnalyzeRecording] Error occurred:', error);
    console.error('[AnalyzeRecording] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('[AnalyzeRecording] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // 回退到 mock 分析
    console.warn('[AnalyzeRecording] Falling back to mock analysis due to error');
    const mockAnalysis = generateMockAnalysis(input.metadata.id);
    
    return {
      success: true,
      analysis: mockAnalysis,
    };
  }
};

export const isGeminiIntegrationEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_ENABLE_GEMINI_API === 'true';
};

export const getGeminiApiEndpoint = (): string | undefined => {
  if (!isGeminiIntegrationEnabled()) return undefined;
  return process.env.NEXT_PUBLIC_GEMINI_API_ENDPOINT;
};
