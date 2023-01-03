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

@MainActor
class AudioRecordingController : ObservableObject {
    enum E : Error {
        case noSpeechRecognitionPermissions
        case audioRecordingControllerNotPrepared
        case notRecording
    }
    
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
    private var speechRecognitionTask: SFSpeechRecognitionTask? = nil
    
    private let buffers = PassthroughSubject<AVAudioPCMBuffer, Never>().share()
    
    private var buffersAsync: AsyncPublisher<some Publisher<AVAudioPCMBuffer, Never>> {
        return AsyncPublisher(buffers)
    }
    
    nonisolated init() {}
    
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
            return
        }
        if speechRecognizerAuthStatus != .authorized {
            throw E.noSpeechRecognitionPermissions
        }
        if isRecording {
            return
        }
        logger.info("starting audio recording")
        
        engine.inputNode.removeTap(onBus: 0)
        let recordingFormat = engine.inputNode.outputFormat(forBus: 0)
        engine.inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { [weak self] buffer, _ in
            if !(self?.isRecording ?? false) {
                // Only process packets if we are recording
                return
            }
            self?.buffers.upstream.send(buffer)
        }
        
        engine.prepare()
        try engine.start()
        isRecording = true
    }
    
    func stopRecording() async {
        if !isAudioRecordingPrepared {
            return
        }
        logger.info("stopping audio recording")
        if engine.isRunning {
            engine.stop()
            engine.inputNode.removeTap(onBus: 0)
            speechRecognitionRequest?.endAudio()
        }
        isRecording = false
    }
    
    func transcribe() -> AsyncThrowingStream<String, Error> {
        if !isRecording {
            return AsyncThrowingStream { continuation in
                continuation.finish(throwing: E.notRecording)
            }
        }
        
        speechRecognitionTask?.cancel()
        speechRecognitionRequest?.endAudio()
        speechRecognitionTask = nil
        speechRecognitionRequest = nil
        
        let speechRecognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        self.speechRecognitionRequest = speechRecognitionRequest
        speechRecognitionRequest.shouldReportPartialResults = true
        
        let bufferingTask = Task {
            for await b in buffersAsync {
                speechRecognitionRequest.append(b)
            }
        }
        
        return AsyncThrowingStream { [weak self] continuation in
            let speechRecognitionTask = speechRecognizer.recognitionTask(with: speechRecognitionRequest, resultHandler: { [continuation] result, error in
                if let result = result {
                    continuation.yield(result.bestTranscription.formattedString)
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
            
            self?.speechRecognitionTask = speechRecognitionTask
        }
    }
    
}

