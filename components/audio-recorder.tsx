"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Loader2 } from "lucide-react"
import { transcribeAndAnalyzeAudio } from "@/app/actions/transcribe-audio"
import { useToast } from "@/hooks/use-toast"

interface AudioRecorderProps {
  noteId: string
  onTranscriptionComplete: (data: any) => void
  onRecordingStart: () => void
  onRecordingStop: () => void
}

export function AudioRecorder({
  noteId,
  onTranscriptionComplete,
  onRecordingStart,
  onRecordingStop,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const { toast } = useToast()

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [isRecording])

  const startRecording = async () => {
    chunksRef.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setRecordingBlob(blob)

        // Stop all tracks on the stream to release the microphone
        stream.getTracks().forEach((track) => track.stop())

        // Reset recording state
        setIsRecording(false)
        setRecordingTime(0)
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }

        onRecordingStop()
      }

      // Set start time reference
      startTimeRef.current = Date.now()

      // Start recording
      mediaRecorderRef.current.start()
      setIsRecording(true)
      onRecordingStart()

      // Start timer with accurate time tracking
      timerRef.current = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setRecordingTime(elapsedTime)
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
  }

  const processRecording = async () => {
    if (!recordingBlob || !noteId) return

    setIsProcessing(true)

    try {
      // Convert blob to ArrayBuffer
      const arrayBuffer = await recordingBlob.arrayBuffer()

      // Send to server for processing
      const result = await transcribeAndAnalyzeAudio(arrayBuffer, noteId)

      if (result.error) {
        toast({
          title: "Processing Error",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.success) {
        toast({
          title: "Processing Complete",
          description: "Your recording has been transcribed and analyzed.",
        })

        // Pass the result to parent component
        onTranscriptionComplete(result)
      }
    } catch (error) {
      console.error("Error processing recording:", error)
      toast({
        title: "Processing Error",
        description: "Failed to process recording.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setRecordingBlob(null)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center space-x-4">
        {!isRecording && !recordingBlob && (
          <Button onClick={startRecording} className="bg-violet-500 hover:bg-violet-600 text-white" size="sm">
            <Mic className="mr-2 h-4 w-4" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <>
            <div className="recording-timer bg-violet-500/10 text-violet-500 dark:bg-violet-900/30 dark:text-violet-400">
              <div className="recording-timer-dot bg-red-500"></div>
              <span className="font-mono">{formatTime(recordingTime)}</span>
            </div>

            <Button
              onClick={stopRecording}
              variant="outline"
              size="sm"
              className="border-violet-500 text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950"
            >
              <Square className="h-4 w-4" />
            </Button>
          </>
        )}

        {recordingBlob && !isProcessing && (
          <Button onClick={processRecording} className="bg-green-500 hover:bg-green-600 text-white" size="sm">
            Process Recording
          </Button>
        )}

        {isProcessing && (
          <Button disabled className="bg-gray-300 text-gray-700" size="sm">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </Button>
        )}
      </div>

      {recordingBlob && !isProcessing && (
        <div className="text-xs text-muted-foreground">
          Recording ready. Click "Process Recording" to transcribe and analyze.
        </div>
      )}
    </div>
  )
}

