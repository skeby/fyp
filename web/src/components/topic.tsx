"use client"

import { topics } from "@/static"
import { Label } from "@radix-ui/react-label"
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"

const Topic = ({ topic } : { topic: string }) => {
    const [quizState, setQuizState] = useState<
      "intro" | "quiz" | "feedback" | "results"
    >("intro")
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  
    const quizData = topics.find((t) => t.slug.toLowerCase() === topic?.toLowerCase())
  
    const handleStartQuiz = () => {
      setQuizState("quiz")
      setCurrentQuestion(0)
      setAnswers({})
      setSelectedAnswer(null)
    }
  
    const handleAnswer = (value: string) => {
      setSelectedAnswer(value)
    }
  
    const handleNext = () => {
      if (selectedAnswer) {
        // Save the answer
        setAnswers((prev) => ({
          ...prev,
          [currentQuestion]: selectedAnswer,
        }))
  
        // Show feedback
        setQuizState("feedback")
      }
    }
  
    const handleContinue = () => {
      if (currentQuestion < (quizData?.questions?.length ?? 0) - 1) {
        // Move to next question
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setQuizState("quiz")
      } else {
        // End the quiz
        setQuizState("results")
      }
    }
  
    const handleEnd = () => {
      setQuizState("results")
    }
  
    const calculateScore = () => {
      let score = 0
      Object.entries(answers).forEach(([questionIndex, answer]) => {
        const index = Number.parseInt(questionIndex)
        if ((quizData?.questions ?? [])[index]?.correct_answer === answer) {
          score++
        }
      })
      return score
    }
  
    const handleRetry = () => {
      setQuizState("intro")
    }
  
    const isCorrect = () => {
      return selectedAnswer === (quizData?.questions ?? [])[currentQuestion]?.correct_answer
    }
  
    return (
      <>
          {!quizData
              ? <p></p>
              :   <>
                      {quizState === "intro" && (
                          <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                  <h1 className="text-2xl font-bold">{quizData.title}</h1>
                              </div>
                              <Card className="gap-0 p-8 py-6 sm:p-10">
                                  <p className="mb-6 text-lg text-neutral-300">
                                  {quizData.description}
                                  </p>
                                  <p className="mb-4">
                                  This contains {quizData.questions.length} multiple choice
                                  questions.
                                  </p>
                                  <Button
                                  size="lg"
                                  onClick={handleStartQuiz}
                                  className="w-fit"
                                  >
                                  Start
                                  </Button>
                              </Card>
                          </div>
                      )}
                      
                      {quizState === "quiz" && (
                          <div className="space-y-6">
                          <div className="flex items-center justify-between">
                              <h1 className="text-2xl font-bold">{quizData.title}</h1>
                              <span className="text-sm font-medium">
                              Question {currentQuestion + 1} of {quizData.questions.length}
                              </span>
                          </div>
  
                          <Card className="py-6 sm:p-10">
                              <h2 className="mb-4 text-xl font-semibold">
                              {quizData.questions[currentQuestion].question}
                              </h2>
  
                              <RadioGroup
                              value={selectedAnswer || ""}
                              onValueChange={handleAnswer}
                              className="mb-6 space-y-3"
                              >
                              {quizData.questions[currentQuestion].options.map((option) => (
                                  <div
                                  key={option.id}
                                  className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-4 transition-colors ${
                                      selectedAnswer === option.id
                                      ? "bg-primary/10 border-primary/40"
                                      : ""
                                  }`}
                                  onClick={() => handleAnswer(option.id)}
                                  >
                                  <RadioGroupItem
                                      value={option.id}
                                      id={`option-${option.id}`}
                                      className="sr-only"
                                  />
                                  <Label
                                      htmlFor={`option-${option.id}`}
                                      className="flex w-full cursor-pointer items-center text-base"
                                  >
                                      <span className="mr-2 font-semibold">
                                      {option.id.toUpperCase()}.
                                      </span>{" "}
                                      {option.text}
                                  </Label>
                                  </div>
                              ))}
                              </RadioGroup>
  
                              <div className="flex justify-end gap-4">
                              <Button size="lg" variant="destructive" onClick={handleEnd}>
                                  End
                              </Button>
                              <Button size="lg" onClick={handleNext} disabled={!selectedAnswer}>
                                  Continue
                              </Button>
                              </div>
                          </Card>
                          </div>
                      )}
  
                      {quizState === "feedback" && (
                          <div className="space-y-6">
                          <div className="flex items-center justify-between">
                              <h1 className="text-2xl font-bold">{quizData.title}</h1>
                              <span className="text-sm font-medium">
                              Question {currentQuestion + 1} of {quizData.questions.length}
                              </span>
                          </div>
  
                          <Card className="p-6 p-8 py-6 sm:p-10">
                              <h2 className="mb-4 text-xl font-semibold">
                              {quizData.questions[currentQuestion].question}
                              </h2>
  
                              <div className="mb-6 space-y-3">
                              {quizData.questions[currentQuestion].options.map((option) => (
                                  <div
                                  key={option.id}
                                  className={`flex items-center space-x-2 rounded-lg border p-4 ${
                                      option.id ===
                                      quizData.questions[currentQuestion].correct_answer
                                      ? "border-green-500 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
                                      : option.id === selectedAnswer
                                          ? option.id !==
                                          quizData.questions[currentQuestion].correct_answer
                                          ? "border-red-500 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
                                          : "border-green-500 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
                                          : ""
                                  }`}
                                  >
                                  <div className="flex w-full items-center text-base">
                                      <span className="mr-2 font-semibold">
                                      {option.id.toUpperCase()}.
                                      </span>{" "}
                                      {option.text}
                                      {option.id ===
                                      quizData.questions[currentQuestion].correct_answer && (
                                      <CheckCircle2 className="ml-auto h-5 w-5 text-green-500" />
                                      )}
                                      {option.id === selectedAnswer &&
                                      option.id !==
                                          quizData.questions[currentQuestion].correct_answer && (
                                          <AlertCircle className="ml-auto h-5 w-5 text-red-500" />
                                      )}
                                  </div>
                                  </div>
                              ))}
                              </div>
  
                              <div className="bg-muted mb-6 rounded-lg p-4">
                              <h3 className="mb-2 font-semibold">Explanation:</h3>
                              <p>{quizData.questions[currentQuestion].explanation}</p>
                              </div>
  
                              <div className="flex justify-end gap-4">
                              <Button size="lg" variant="destructive" onClick={handleEnd}>
                                  End
                              </Button>
                              <Button size="lg" onClick={handleContinue}>
                                  {currentQuestion < quizData.questions.length - 1
                                  ? "Next Question"
                                  : "See Results"}
                              </Button>
                              </div>
                          </Card>
                          </div>
                      )}
  
                      {quizState === "results" && (
                          <div className="space-y-6">
                          <h1 className="text-3xl font-bold">Quiz Results</h1>
                          <Card className="p-6 p-8 py-6 sm:p-10">
                              <h2 className="mb-4 text-2xl font-bold">
                              Your Score: {calculateScore()} out of {quizData.questions.length}
                              </h2>
                              <p className="mb-6">
                              You answered {Object.keys(answers).length} out of{" "}
                              {quizData.questions.length} questions.
                              </p>
                              <div className="flex gap-4">
                              <Button size="lg" onClick={handleRetry}>
                                  Try Again
                              </Button>
                              <Button
                                  size="lg"
                                  variant="outline"
                                  onClick={() => setQuizState("intro")}
                              >
                                  Back to Overview
                              </Button>
                              </div>
                          </Card>
                          </div>
                      )}
                  </>
          }
      </>
    )
  }
  

export default Topic