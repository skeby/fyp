"use client";

import { Label } from "@radix-ui/react-label";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppMutation, useAppQuery, useAppUser } from "@/hooks/use-app";
import { paths } from "@/services/endpoint";
import { Topic as TopicType, User } from "@/types";
import { useParams } from "next/navigation";
import Spinner from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { message } from "@/components/misc/message-provider";

type SubmitResponseType = {
  test_id: string;
  submitted_answer: string;
  correct_answer: string;
  was_correct: boolean;
  explanation: string; // TODO: Add this to model
  current_theta: number;
  target_difficulty?: number;
  next_question?: {
    id: string; // TODO: Add this to model
    question: string;
    options: { A: string; B: string; C: string; D: string };
  };
  result?: {
    administered: string[];
    correct_ids: string[];
    wrong_ids: string[];
  };
};

const Topic = () => {
  const [quizState, setQuizState] = useState<
    "intro" | "quiz" | "feedback" | "results"
  >("intro");
  const [currentQuestion, setCurrentQuestion] = useState<Omit<
    TopicType["questions"][0],
    "correct_answer" | "explanation"
  > | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [test_id, setTestId] = useState<string | null>(null);
  const [submitResponse, setSubmitResponse] =
    useState<SubmitResponseType | null>(null);

  const params = useParams();
  const course_slug = params?.course;
  const topic_slug = params?.topic;

  console.log("course:", course_slug, "topic:", topic_slug);

  const { data, isLoading, isFetching } = useAppQuery<{ topic: TopicType }>({
    queryKey: ["topic", { course_slug, topic_slug }],
    data: { course_slug, topic_slug },
    path: paths.course.topic.get,
    method: "post",
  });

  const topic = data?.data?.topic;

  const { user } = useAppUser();

  const { mutate: startTest, isPending: isStartTestPending } = useAppMutation<{
    question: Omit<TopicType["questions"][0], "correct_answer" | "explanation">;
    test_id: string;
  }>({
    mutationKey: ["test"],
    path: paths.course.topic.start,
    onSuccess: (data) => {
      if (data?.data) {
        setTestId(data?.data?.test_id);
        setCurrentQuestion(data?.data?.question);
        setQuizState("quiz");
      }
    },
  });

  const { mutate: submitAnswer, isPending: isSubmitAnswerPending } =
    useAppMutation<SubmitResponseType>({
      mutationKey: ["submit-answer"],
      path: paths.course.topic.submit,
      onSuccess: (data) => {
        // Show feedback
        if (data?.data) {
          setSubmitResponse(data?.data);
          setQuizState("feedback");
        }
      },
    });

  const handleStart = () => {
    startTest({ course_slug, topic_slug });
  };

  const handleAnswer = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleNext = () => {
    if (selectedAnswer) {
      // Save the answer
      if (test_id) {
        submitAnswer({ test_id, submitted_answer: selectedAnswer });
      } else {
        message.error("Test ID is not available. Please try again.");
      }
    } else {
      message.error("Please select an answer before continuing.");
    }
  };

  const handleContinue = () => {
    if (submitResponse) {
      const next_question = submitResponse.next_question;
      if (next_question && !submitResponse?.result) {
        // Move to next question
        setCurrentQuestion({
          id: next_question.id,
          question: next_question.question,
          options: [
            { id: "A", text: next_question.options.A },
            { id: "B", text: next_question.options.B },
            { id: "C", text: next_question.options.C },
            { id: "D", text: next_question.options.D },
          ],
        });
        setQuizState("quiz");
        setSelectedAnswer(null);
        setSubmitResponse(null);
      } else {
        // End the quiz
        handleEnd();
      }
    } else {
      message.error("Submit response not available");
    }
  };

  const handleEnd = () => {
    setQuizState("results");
    setSelectedAnswer(null);
    setCurrentQuestion(null);
    setSubmitResponse(null);
  };

  // const calculateScore = () => {
  //   let score = 0;
  //   Object.entries(answers).forEach(([questionIndex, answer]) => {
  //     const index = Number.parseInt(questionIndex);
  //     if ((topic?.questions ?? [])[index]?.correct_answer === answer) {
  //       score++;
  //     }
  //   });
  //   return score;
  // };

  const handleRetry = () => {
    setQuizState("intro");
  };

  // const isCorrect = () => {
  //   return (
  //     selectedAnswer ===
  //     (topic?.questions ?? [])[currentQuestion]?.correct_answer
  //   );
  // };

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        if (quizState === "intro") {
          handleStart();
        } else if (quizState === "quiz" && selectedAnswer) {
          handleNext();
        } else if (quizState === "feedback") {
          handleContinue();
        }
      }
    };

    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [quizState, selectedAnswer]);

  return (
    <main className="flex h-full min-h-[calc(100vh-48px)] w-full flex-col">
      {topic && (
        <div className="sticky top-0 flex h-12 items-center justify-between border-b p-2">
          <span className="min-w-[150px]"></span>
          <h1 className="w-full text-center font-medium capitalize">
            {topic?.title}
          </h1>
          {/* <p className="min-w-[150px]">
            {currentQuestion !== -1 && (
              <span className="text-sm font-medium">
                Question {currentQuestion + 1} of {topic.questions.length}
              </span>
            )}
          </p> */}
        </div>
      )}
      <div className="mx-auto h-full w-full max-w-5xl flex-grow px-6 py-12">
        {isLoading || isFetching ? (
          <div className="mx-auto flex h-full w-fit items-center justify-center gap-2">
            <Spinner className="size-6" />{" "}
            <span className="text-sm">Loading</span>
          </div>
        ) : !topic ? (
          <p>No quiz available</p>
        ) : (
          <>
            {quizState === "intro" && (
              <div className="space-y-6">
                <Card className="gap-0 p-8 py-6 sm:p-10">
                  <p className="mb-6 text-lg text-neutral-300">
                    {topic.description}
                  </p>
                  <p className="mb-4">
                    This adaptive test contains {topic.questions.length}{" "}
                    possible questions you can be tested on. Each question has
                    multiple-choice answers, and you will receive feedback on
                    your answers.
                  </p>
                  <Button
                    size="lg"
                    onClick={handleStart}
                    loading={isStartTestPending}
                    className="w-fit"
                  >
                    Start
                  </Button>
                </Card>
              </div>
            )}

            {quizState === "quiz" && (
              <div className="space-y-6">
                {/* <div className="flex items-center justify-end">
                  <h1 className="text-2xl font-bold">{topic.title}</h1>
                  <span className="text-sm font-medium">
                    Question {currentQuestion + 1} of{" "}
                    {topic.questions.length}
                  </span>
                </div> */}

                <Card className="p-8 py-6 sm:p-10">
                  <h2 className="mb-4 text-xl font-semibold">
                    {currentQuestion?.question}
                  </h2>

                  <RadioGroup
                    value={selectedAnswer || ""}
                    onValueChange={(value) => {
                      if (!isSubmitAnswerPending) {
                        handleAnswer(value);
                      }
                    }}
                    className="mb-6 space-y-3"
                  >
                    {(currentQuestion?.options ?? []).map((option) => (
                      <div
                        key={option.id}
                        className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-4 transition-colors ${
                          selectedAnswer === option.id
                            ? "bg-primary/10 border-primary/40"
                            : ""
                        }`}
                        onClick={() => {
                          if (!isSubmitAnswerPending) {
                            handleAnswer(option.id);
                          }
                        }}
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

                  <div className="flex justify-end gap-3">
                    <Button size="lg" variant="destructive" onClick={handleEnd}>
                      End
                    </Button>
                    <Button
                      loading={isSubmitAnswerPending}
                      size="lg"
                      variant="outline"
                      onClick={handleNext}
                      disabled={!selectedAnswer}
                    >
                      Continue
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {quizState === "feedback" && (
              <div className="space-y-6">
                {/* <div className="flex items-center justify-end">
                  <h1 className="text-2xl font-bold">{topic.title}</h1>
                  <span className="text-sm font-medium">
                    Question {currentQuestion + 1} of{" "}
                    {topic.questions.length}
                  </span>
                </div> */}

                <Card className="p-8 py-6 sm:p-10">
                  <h2 className="mb-4 text-xl font-semibold">
                    {currentQuestion?.question}
                  </h2>

                  <div className="mb-6 space-y-3">
                    {(currentQuestion?.options ?? []).map((option) => (
                      <div
                        key={option.id}
                        className={`flex items-center space-x-2 rounded-lg border p-4 ${
                          option.id === submitResponse?.correct_answer
                            ? "border-green-500 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
                            : option.id === selectedAnswer
                              ? option.id !== submitResponse?.correct_answer
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
                          {option.id === submitResponse?.correct_answer && (
                            <CheckCircle2 className="ml-auto h-5 w-5 text-green-500" />
                          )}
                          {option.id === selectedAnswer &&
                            option.id !== submitResponse?.correct_answer && (
                              <AlertCircle className="ml-auto h-5 w-5 text-red-500" />
                            )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-muted mb-6 rounded-lg p-4">
                    <h3 className="mb-2 font-semibold">Explanation:</h3>
                    <p>{submitResponse?.explanation}</p>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button size="lg" variant="destructive" onClick={handleEnd}>
                      End
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleContinue}
                    >
                      {submitResponse?.next_question && !submitResponse?.result
                        ? "Next Question"
                        : "See Results"}
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {quizState === "results" && (
              <div className="space-y-6">
                {/* <h1 className="text-3xl font-bold">Quiz Results</h1> */}
                <Card className="p-8 py-6 sm:p-10">
                  <h2 className="mb-4 text-2xl font-bold">
                    Your Score:{" "}
                    {(submitResponse?.result?.correct_ids ?? [])?.length} out of{" "}
                    {(submitResponse?.result?.correct_ids ?? [])?.length}
                  </h2>
                  {/* <p className="mb-6">
                    You answered {Object.keys(answers).length} out of{" "}
                    {topic.questions.length} questions.
                  </p> */}
                  <div className="flex gap-3">
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
        )}
      </div>
    </main>
  );
};

export default Topic;
