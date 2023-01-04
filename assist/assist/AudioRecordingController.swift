//
//  AudioRecordingController.swift
//  assist
//
//  Created by Nathan Kot on 3/01/23.
//

import Foundation
import Speech
import SwiftUI
import Combine

actor AudioRecordingController : ObservableObject {
    
    let state: AppState
    
    var isRecording: Bool = false
    var speechRecognizerAuthStatus: SFSpeechRecognizerAuthorizationStatus = .notDetermined
    var isAudioRecordingPrepared = false
    
    private let engine = AVAudioEngine()
    
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(
        identifier:
            Locale.current.identifier.starts(with: "en-") ||
            Locale.current.identifier.starts(with: "en_")
            ? Locale.current.identifier
            : "en-US"))!
    
    private var speechRecognitionRequest: SFSpeechAudioBufferRecognitionRequest? = nil
    
    private let buffers = PassthroughSubject<AVAudioPCMBuffer, Never>().share()
    private var buffersAsync: AsyncPublisher<some Publisher<AVAudioPCMBuffer, Never>> {
        return AsyncPublisher(buffers)
    }
    
    private var transcribeStream: AsyncThrowingStream<String, Error>? = nil
    
    init(state: AppState) {
        self.state = state
    }
    
    func prepare() async {
        if isAudioRecordingPrepared {
            return
        }
        
        let authStatus = await withCheckedContinuation { continuation in
            SFSpeechRecognizer.requestAuthorization { authStatus in
                continuation.resume(returning: authStatus)
            }
        }
        
        speechRecognizerAuthStatus = authStatus
        isAudioRecordingPrepared = true
    }
    
    func startRecording() async throws {
        if !isAudioRecordingPrepared {
            throw AppState.ErrorType.Internal("audio recording controller should be prepared")
        }
        if speechRecognizerAuthStatus != .authorized {
            throw AppState.ErrorType.InsufficientAppPermissions("speech recognition")
        }
        if isRecording {
            throw AppState.ErrorType.Internal("should not be recording")
        }

        try await state.transition(newState: .Recording(bestTranscription: nil)) { doTransition in
            logger.info("starting audio recording")
            
            engine.inputNode.removeTap(onBus: 0)
            let recordingFormat = engine.inputNode.outputFormat(forBus: 0)
            // TODO if native format is set, add a re-encode step
            
            engine.inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { [weak self] buffer, _ in
                self?.buffers.upstream.send(buffer)
            }
            
            await doTransition()
            engine.prepare()
            try engine.start()
            isRecording = true
            transcribeStream = try transcribe()
        }
        
    }
    
    func stopRecording() async throws -> String? {
        if !isAudioRecordingPrepared {
            throw AppState.ErrorType.Internal("audio recording not prepared")
        }
        if !engine.isRunning {
            throw AppState.ErrorType.Internal("audio engine expected to be running")
        }
        engine.stop()
        engine.inputNode.removeTap(onBus: 0)
        if !isRecording {
            throw AppState.ErrorType.Internal("expected to be recording")
        }
        logger.info("stopping audio recording")
        speechRecognitionRequest?.endAudio()
        isRecording = false
        
        var result: String? = nil
        if let transcribeStream = transcribeStream {
            // Use the last transcription, transcription may continue even after
            // the audio engine has finished, so we wait:
            for try await transcription in transcribeStream {
                result = transcription
            }
        }

        return result
    }
    
    fileprivate func transcribe() throws -> AsyncThrowingStream<String, Error> {
        if !isRecording {
            throw AppState.ErrorType.Internal("should be recording when transcribe() is called")
        }
        
        speechRecognitionRequest?.endAudio()
        speechRecognitionRequest = nil
        
        let speechRecognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        self.speechRecognitionRequest = speechRecognitionRequest
        speechRecognitionRequest.shouldReportPartialResults = true
        
        let bufferingTask = Task {
            for await b in buffersAsync {
                speechRecognitionRequest.append(b)
            }
        }
        
        return AsyncThrowingStream(bufferingPolicy: .bufferingNewest(1)) { continuation in
            let speechRecognitionTask = speechRecognizer.recognitionTask(with: speechRecognitionRequest, resultHandler: { [continuation] result, error in
                if let result = result {
                    let bestTranscription = result.bestTranscription.formattedString
                    
                    // TODO the following is ugly:
                    Task { [weak self] in try? await self?.state.transition(newState: .Recording(bestTranscription: bestTranscription)) }
                    
                    continuation.yield(bestTranscription)
                    if result.isFinal {
                        logger.info("received final recognition result")
                        continuation.finish()
                    }
                    return
                }
                
                if let error = error {
                    continuation.finish(throwing: error)
                    return
                }
            })
            
            continuation.onTermination = { _ in
                speechRecognitionTask.cancel()
                bufferingTask.cancel()
            }
        }
    }
    
}

