//
//  AudioRecordingController.swift
//  assist
//
//  Created by Nathan Kot on 3/01/23.
//

import Foundation
import Speech
import SwiftUI

@MainActor
class AudioRecordingController : ObservableObject {
    enum E : Error {
        case noSpeechRecognitionPermissions
        case audioRecordingControllerNotPrepared
    }
    
    let state: AppState
    let engine = AVAudioEngine()
    
    var bufferStream: AsyncStream<(AVAudioPCMBuffer, AVAudioTime)>? = nil
    
    nonisolated init(state: AppState) {
        self.state = state
    }
    
    func prepare() async {
        if state.isAudioRecordingPrepared {
            return
        }
        
        let authStatus = await withCheckedContinuation { continuation in
            SFSpeechRecognizer.requestAuthorization { authStatus in
                continuation.resume(returning: authStatus)
            }
        }
        state.speechRecognizerAuthStatus = authStatus
        
        let inputNode = engine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        let bufferStream = AsyncStream(bufferingPolicy: .bufferingNewest(5)) { [weak self, inputNode] continuation in
            inputNode.installTap(onBus: 0, bufferSize: 512, format: recordingFormat) { [weak self] buffer, when in
                if !(self?.state.isRecording ?? false) {
                    // Only process packets if we are recording
                    return
                }
                continuation.yield((buffer, when))
            }
        }
        
        self.bufferStream = bufferStream
        
        engine.prepare()
        // Start-stop the engine so that we request permissions here:
        try? engine.start()
        engine.stop()
        
        state.isAudioRecordingPrepared = true
    }
    
    func startRecording() async throws {
        if !state.isAudioRecordingPrepared {
            return
        }
        if state.speechRecognizerAuthStatus != .authorized {
            throw E.noSpeechRecognitionPermissions
        }
        if state.isRecording {
            return
        }
        logger.info("starting audio recording")
        try engine.start()
        state.isRecording = true
    }
    
    func stopRecording() async {
        if !state.isAudioRecordingPrepared {
            return
        }
        logger.info("stopping audio recording")
        if engine.isRunning {
            engine.stop()
        }
        state.isRecording = false
    }
    
    func transcribe() -> AsyncThrowingStream<String, Error> {
        guard let bufferStream = bufferStream else {
            return AsyncThrowingStream { continuation in
                continuation.finish(throwing: E.audioRecordingControllerNotPrepared)
            }
        }
        
        let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))!
        let recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        recognitionRequest.shouldReportPartialResults = true
        
        let bufferingTask = Task {
            for await (b, _) in bufferStream {
                recognitionRequest.append(b)
            }
        }
        
        return AsyncThrowingStream { continuation in
            speechRecognizer.recognitionTask(with: recognitionRequest, resultHandler: { [continuation] result, error in
                if let result = result {
                    continuation.yield(result.bestTranscription.formattedString)
                    if result.isFinal {
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
                bufferingTask.cancel()
            }
        }
    }
    
}

