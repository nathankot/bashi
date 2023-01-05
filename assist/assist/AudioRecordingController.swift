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

actor AudioRecordingController {
    
    private var speechRecognizerAuthStatus: SFSpeechRecognizerAuthorizationStatus = .notDetermined
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(
        identifier:
            Locale.current.identifier.starts(with: "en-") ||
            Locale.current.identifier.starts(with: "en_")
            ? Locale.current.identifier
            : "en-US"))!
    
    
    private var engine: AVAudioEngine? = nil
    private var speechRecognitionRequest: SFSpeechAudioBufferRecognitionRequest? = nil
    private var speechRecognitionTask: SFSpeechRecognitionTask? = nil
    private var transcribedSubject: CurrentValueSubject<String, Error>? = nil
    
    public var transcribedPublished: AnyPublisher<String, Error>? {
        return transcribedSubject?.eraseToAnyPublisher()
    }
    
    public var transcribeStream: AsyncThrowingPublisher<AnyPublisher<String, Error>>? {
        guard let published = transcribedPublished else { return nil }
        return AsyncThrowingPublisher(published)
    }
    
    func prepare() async {
        let authStatus = await withCheckedContinuation { continuation in
            SFSpeechRecognizer.requestAuthorization { authStatus in
                continuation.resume(returning: authStatus)
            }
        }
        speechRecognizerAuthStatus = authStatus
    }
    
    
    private static func prepareEngine() throws -> (AVAudioEngine, SFSpeechAudioBufferRecognitionRequest) {
        let audioEngine = AVAudioEngine()
        
        let request = SFSpeechAudioBufferRecognitionRequest()
        request.shouldReportPartialResults = true
        
        let inputNode = audioEngine.inputNode
        
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { (buffer: AVAudioPCMBuffer, when: AVAudioTime) in
            request.append(buffer)
        }
        audioEngine.prepare()
        try audioEngine.start()
        
        return (audioEngine, request)
    }

    func reset() {
        speechRecognitionTask?.cancel()
        engine?.stop()
        engine = nil
        speechRecognitionRequest = nil
        speechRecognitionTask = nil
        transcribedSubject = nil
    }
    
    func startRecording() throws {
        if speechRecognizerAuthStatus != .authorized {
            throw AppState.ErrorType.InsufficientAppPermissions("speech recognition")
        }
        if !speechRecognizer.isAvailable {
            throw AppState.ErrorType.InsufficientAppPermissions("speech recognizer not available")
        }
        if engine?.isRunning ?? false {
            throw AppState.ErrorType.Internal("should not be recording")
        }
        logger.info("starting audio recording")
        
        do {
            let (engine, speechRecognitionRequest) = try Self.prepareEngine()
            self.engine = engine
            let transcribedSubject = CurrentValueSubject<String, Error>("")
            self.transcribedSubject = transcribedSubject
            self.speechRecognitionRequest = speechRecognitionRequest
            self.speechRecognitionTask = speechRecognizer.recognitionTask(with: speechRecognitionRequest, resultHandler: { result, err in
                var finished = false
                if let result = result {
                    transcribedSubject.send(result.bestTranscription.formattedString)
                    if result.isFinal {
                        transcribedSubject.send(completion: .finished)
                        finished = true
                    }
                } else if let err = err {
                    transcribedSubject.send(completion: .failure(err))
                    finished = true
                }
                if finished {
                    engine.stop()
                    engine.inputNode.removeTap(onBus: 0)
                }
            })
        } catch {
            reset()
            throw error
        }
    }
    
    func stopRecording() async throws -> String? {
        logger.info("stopping audio recording")
        engine?.stop()
        speechRecognitionRequest?.endAudio()
        
        var result: String? = nil
        if let transcribeStream = transcribeStream {
            // Use the last transcription, transcription may continue even after
            // the audio engine has finished, so we wait:
            for try await transcription in transcribeStream {
                result = transcription
            }
        }
        
        reset()

        return result
    }
    
}

