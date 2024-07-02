import speech, { SpeechClient } from '@google-cloud/speech';
import { google } from '@google-cloud/speech/build/protos/protos';
import Long from 'long';
import * as pumpify from 'pumpify';

let speechClient: SpeechClient | null = null;

// Reference: 
// https://rohitp934.medium.com/speech-to-text-in-realtime-with-gcp-and-socket-io-ad6fc788c7bb
class SpeechToTextStream {  
  recognizeStream!: pumpify | null;
  socket: any;

  audioInput: DataView[] = [];

  constructor(socket: any) {
    this.socket = socket;
  }

  startStream(request: any) {
    console.log('startStream: ' + request);
    this.audioInput = [];

    try {
      if (!speechClient) {
        speechClient = new speech.SpeechClient();
      }

      this.recognizeStream = speechClient.streamingRecognize({
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: request.sampleRate,
          languageCode: request.language,
        },
        interimResults: true
      });

      this.recognizeStream?.on('error', (error: any) => {
        this.socket.emit('streamError', error);
        this.endStream();
      });
  
      this.recognizeStream?.on('data', this.speechCallback.bind(this));
    } catch (error) {
      console.error(error);
      this.socket.emit('streamError', error);
    }
  }

  speechCallback(stream: google.cloud.speech.v1.StreamingRecognizeResponse) {
		// Null checks
		if (
			!stream.results ||
			!stream.results[0] ||
			!stream.results[0].alternatives ||
			!stream.results[0].isFinal
		) {
      return;
		}

    console.log('speechCallback', stream?.results[0]?.alternatives[0]?.transcript);

    this.socket.emit(
      'transcription',
      stream.results[0].alternatives[0].transcript
    );
	}

  recieveAudioChunk(data: DataView) {
    console.log('recieveAudioChunk', data.byteLength);

    this.audioInput.push(data);

    if (this.recognizeStream) {
      this.recognizeStream.write(data);
    }
  }
  
  endStream() {
    console.log('endStream');

    if (this.recognizeStream) {
      this.recognizeStream.end();
			this.recognizeStream.removeAllListeners();
    }

    this.recognizeStream = null;
  }
}

export default SpeechToTextStream;