"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Copy, FileText, BrainCircuit, ListChecks, GraduationCap, PlusCircle, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TranscriptionViewProps {
  data: {
    transcription: string
    summary: string
    keyPoints: string[]
    isLecture: boolean
    quiz?: {
      questions: {
        question: string
        options: string[]
        correctAnswer: number
      }[]
    }
  }
  onClose: () => void
  onInsertContent: (content: string) => void
}

export function TranscriptionView({ data, onClose, onInsertContent }: TranscriptionViewProps) {
  const [activeTab, setActiveTab] = useState<string>("transcription")
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [showQuizResults, setShowQuizResults] = useState<boolean>(false)
  const { toast } = useToast()

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(type)

    toast({
      title: "Copied to clipboard",
      description: `${type} has been copied to your clipboard.`,
    })

    setTimeout(() => setCopiedText(null), 2000)
  }

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers]
    newAnswers[questionIndex] = answerIndex
    setQuizAnswers(newAnswers)
  }

  const checkQuizAnswers = () => {
    setShowQuizResults(true)
  }

  const resetQuiz = () => {
    setQuizAnswers([])
    setShowQuizResults(false)
  }

  // Update the insertIntoNote function to use the provided callback
  const insertIntoNote = (content: string) => {
    onInsertContent(content)

    // Show success toast but don't close the panel
    toast({
      title: "Content inserted",
      description: "The selected content has been inserted into your note.",
    })
  }

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start px-4 pt-2 bg-transparent border-b border-white/5">
          <TabsTrigger value="transcription" className="data-[state=active]:bg-white/5">
            <FileText className="h-4 w-4 mr-1 text-blue-400" />
            <span>Transcript</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="data-[state=active]:bg-white/5">
            <BrainCircuit className="h-4 w-4 mr-1 text-violet-400" />
            <span>Summary</span>
          </TabsTrigger>
          <TabsTrigger value="keyPoints" className="data-[state=active]:bg-white/5">
            <ListChecks className="h-4 w-4 mr-1 text-indigo-400" />
            <span>Key Points</span>
          </TabsTrigger>
          {data.isLecture && data.quiz && (
            <TabsTrigger value="quiz" className="data-[state=active]:bg-white/5">
              <GraduationCap className="h-4 w-4 mr-1 text-purple-400" />
              <span>Quiz</span>
            </TabsTrigger>
          )}
        </TabsList>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-20rem)]">
          <TabsContent value="transcription">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  <h3 className="text-sm font-medium">Full Transcription</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(data.transcription, "Transcription")}
                  className="h-8 px-2"
                >
                  {copiedText === "Transcription" ? (
                    <Check className="h-3.5 w-3.5 text-green-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              <div className="ai-gradient-border">
                <div className="bg-white/5 backdrop-blur-sm rounded-[0.7rem] p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {data.transcription}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => insertIntoNote(data.transcription)} className="ai-glow" size="sm">
                  <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                  <span>Insert into Note</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="summary">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-violet-400" />
                  <h3 className="text-sm font-medium">AI Summary</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(data.summary, "Summary")}
                  className="h-8 px-2"
                >
                  {copiedText === "Summary" ? (
                    <Check className="h-3.5 w-3.5 text-green-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              <div className="ai-gradient-border">
                <div className="bg-white/5 backdrop-blur-sm rounded-[0.7rem] p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{data.summary}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => insertIntoNote(data.summary)} className="ai-glow" size="sm">
                  <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                  <span>Insert into Note</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="keyPoints">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-indigo-400" />
                  <h3 className="text-sm font-medium">Key Points</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(data.keyPoints.map((p) => `• ${p}`).join("\n"), "Key Points")}
                  className="h-8 px-2"
                >
                  {copiedText === "Key Points" ? (
                    <Check className="h-3.5 w-3.5 text-green-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              <div className="ai-gradient-border">
                <div className="bg-white/5 backdrop-blur-sm rounded-[0.7rem] p-4">
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {data.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 mt-0.5 text-indigo-400 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => insertIntoNote(data.keyPoints.map((p) => `• ${p}`).join("\n"))}
                  className="ai-glow"
                  size="sm"
                >
                  <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                  <span>Insert into Note</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          {data.isLecture && data.quiz && (
            <TabsContent value="quiz">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-purple-400" />
                    <h3 className="text-sm font-medium">Knowledge Check</h3>
                  </div>
                  {showQuizResults ? (
                    <Button variant="outline" size="sm" onClick={resetQuiz} className="h-8 px-2 text-muted-foreground">
                      Reset Quiz
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={checkQuizAnswers}
                      className="h-8 px-2 text-muted-foreground"
                      disabled={quizAnswers.length < data.quiz.questions.length}
                    >
                      Check Answers
                    </Button>
                  )}
                </div>
                <div className="space-y-6">
                  {data.quiz.questions.map((question, qIndex) => (
                    <div key={qIndex} className="ai-gradient-border">
                      <div className="bg-white/5 backdrop-blur-sm rounded-[0.7rem] p-4 space-y-3">
                        <p className="font-medium text-sm">
                          {qIndex + 1}. {question.question}
                        </p>
                        <div className="space-y-2">
                          {question.options.map((option, oIndex) => (
                            <div
                              key={oIndex}
                              className={`
                              flex items-center p-2 rounded-md cursor-pointer text-sm
                              ${quizAnswers[qIndex] === oIndex ? "bg-primary/10" : "hover:bg-white/5"}
                              ${
                                showQuizResults && oIndex === question.correctAnswer
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                  : ""
                              }
                              ${
                                showQuizResults && quizAnswers[qIndex] === oIndex && oIndex !== question.correctAnswer
                                  ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                                  : ""
                              }
                            `}
                              onClick={() => !showQuizResults && handleAnswerSelect(qIndex, oIndex)}
                            >
                              <div
                                className={`
                              h-4 w-4 rounded-full border mr-2 flex items-center justify-center flex-shrink-0
                              ${quizAnswers[qIndex] === oIndex ? "border-primary" : "border-muted-foreground"}
                            `}
                              >
                                {quizAnswers[qIndex] === oIndex && (
                                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                                )}
                              </div>
                              {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {showQuizResults && (
                  <div className="mt-4 p-3 bg-white/5 backdrop-blur-sm rounded-[0.7rem]">
                    <p className="text-sm font-medium">
                      Score: {data.quiz.questions.filter((q, i) => quizAnswers[i] === q.correctAnswer).length} /{" "}
                      {data.quiz.questions.length}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  )
}

