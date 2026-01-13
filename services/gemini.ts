
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";

// Standard base64 helpers
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Image Editing Service
 */
export async function editFoodImage(base64Image: string, prompt: string, mimeType: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: `You are a food photography expert. Modify this image according to the request: "${prompt}". Return ONLY the modified image.`,
        },
      ],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image returned from Gemini");
}

/**
 * Live API (Voice Assistant) Implementation
 */
export async function connectVoiceAssistant(
  callbacks: {
    onAudioChunk: (buffer: AudioBuffer) => void;
    onInterruption: () => void;
    onUserTranscription: (text: string) => void;
    onAiTranscription: (text: string) => void;
  }
) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    console.error("Microphone access denied", err);
    throw err;
  }

  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: {
      onopen: () => {
        const source = inputAudioContext.createMediaStreamSource(stream);
        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
        scriptProcessor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const l = inputData.length;
          const int16 = new Int16Array(l);
          for (let i = 0; i < l; i++) {
            int16[i] = inputData[i] * 32768;
          }
          const pcmBlob = {
            data: encode(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
          };
          sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
        };
        source.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext.destination);
      },
      onmessage: async (message: LiveServerMessage) => {
        // Transcriptions
        if (message.serverContent?.outputTranscription) {
          callbacks.onAiTranscription(message.serverContent.outputTranscription.text);
        } else if (message.serverContent?.inputTranscription) {
          callbacks.onUserTranscription(message.serverContent.inputTranscription.text);
        }

        // Audio chunks
        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (audioData) {
          const buffer = await decodeAudioData(decode(audioData), outputAudioContext, 24000, 1);
          callbacks.onAudioChunk(buffer);
        }

        if (message.serverContent?.interrupted) {
          callbacks.onInterruption();
        }
      },
      onerror: (e) => console.error("Live API Error", e),
      onclose: () => console.log("Live API Closed"),
    },
    config: {
      responseModalities: [Modality.AUDIO],
      outputAudioTranscription: {},
      inputAudioTranscription: {},
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
      systemInstruction: "You are 'Tasty AI', the voice of the Tasty Food app. You are a warm, traditional yet modern chef. You help users with recipe instructions, cooking tips, and ingredient substitutions. Keep responses concise and food-focused.",
    },
  });

  return {
    sessionPromise,
    close: async () => {
      const session = await sessionPromise;
      session.close();
      stream.getTracks().forEach(t => t.stop());
      inputAudioContext.close();
      outputAudioContext.close();
    }
  };
}
