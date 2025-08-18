"use client";

import { Label } from "@radix-ui/react-label";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { CheckCircle2, AlertCircle, ChevronLeft, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppMutation, useAppQuery, useAppUser } from "@/hooks/use-app";
import { paths } from "@/services/endpoint";
import { Badge, Course, Topic as TopicType, User } from "@/types";
import { useParams } from "next/navigation";
import Spinner from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { message } from "@/components/misc/message-provider";
import Link from "next/link";
import ProgressBar from "@/components/ui/progress-bar";

type SubmitResponseType = {
  test_id: string;
  submitted_answer: string;
  correct_answer: string;
  was_correct: boolean;
  explanation: string; // TODO: Add this to model
  current_theta: number;
  current_score_percentage: number;
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
    xp_earned: number;
    badges_earned?: Badge[];
    average_difficulty: number;
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
  const [currentTheta, setCurrentTheta] = useState<number | null>(null);
  const [currentScorePercentage, setCurrentScorePercentage] = useState<
    number | null
  >(null);

  const params = useParams();
  const course_slug = params?.course;
  const topic_slug = params?.topic;

  const { data, isLoading, isFetching } = useAppQuery<{
    topic: TopicType;
    course: Pick<Course, "title" | "description" | "slug">;
  }>({
    queryKey: ["topic", { course_slug, topic_slug }],
    data: { course_slug, topic_slug },
    path: paths.course.topic.get,
    method: "post",
  });

  const topic = data?.data?.topic;
  const course = data?.data?.course;

  const { user, refetch: refetchUser } = useAppUser();

  const { mutate: startTest, isPending: isStartTestPending } = useAppMutation<{
    question: Omit<TopicType["questions"][0], "correct_answer" | "explanation">;
    test_id: string;
    question_number: number;
    current_theta?: number;
    current_score_percentage?: number;
  }>({
    mutationKey: ["test"],
    path: paths.course.topic.start,
    onSuccess: (data) => {
      if (data?.data) {
        setTestId(data?.data?.test_id);
        setCurrentQuestion(data?.data?.question);
        setQuizState("quiz");
        if (typeof data?.data?.current_theta === "number") {
          setCurrentTheta(data?.data?.current_theta);
        }
        if (typeof data?.data?.current_score_percentage === "number") {
          setCurrentScorePercentage(data?.data?.current_score_percentage);
        }
      }
    },
  });

  const { mutate: submitAnswer, isPending: isSubmitAnswerPending } =
    useAppMutation<SubmitResponseType>({
      mutationKey: ["submit-answer"],
      path: paths.course.topic.submit,
      showSuccess: false,
      onSuccess: (data) => {
        // Show feedback
        if (data?.data) {
          setSubmitResponse(data?.data);
          setCurrentTheta(data?.data?.current_theta);
          setCurrentScorePercentage(data?.data?.current_score_percentage);
          setQuizState("feedback");
          if (
            typeof data?.data?.result?.xp_earned === "number" &&
            data?.data?.result?.xp_earned
          ) {
            message.success(
              `🎉 Well done! You just earned +${data?.data?.result?.xp_earned} XP for completing this test`,
              10,
            );
            refetchUser();
          }
          if (
            data?.data?.result?.badges_earned &&
            data?.data?.result?.badges_earned?.length > 0
          ) {
            const badges_earned = data?.data?.result?.badges_earned;
            badges_earned.forEach((badge) => {
              message.success(
                <>
                  🎉 Well done! You just earned a{" "}
                  <span className="font-semibold">{badge.name}</span> badge{" "}
                  {badge.reason}.{" "}
                  <Link
                    href={user ? `/profile/${user?.username}` : ""}
                    className="font-medium underline"
                  >
                    View badge
                  </Link>
                </>,
                10,
              );
            });
          }
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
        submitAnswer({ test_id, answer: selectedAnswer });
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
          ...next_question,
          options: [
            { id: "A", text: next_question.options.A },
            { id: "B", text: next_question.options.B },
            { id: "C", text: next_question.options.C },
            { id: "D", text: next_question.options.D },
          ],
        });
        setQuizState("quiz");
        setSelectedAnswer(null);
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
    // setSubmitResponse(null);
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
    setSubmitResponse(null);
    setCurrentTheta(null);
    setCurrentScorePercentage(null);
    handleStart();
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
        <div className="bg-background sticky top-12 z-50 h-12 border-b px-1.5 py-2 min-[370px]:px-2 sm:px-6">
          <div className="max-w-res flex h-full items-center justify-between">
            <div className="sm:min-w-[200px]">
              {course && (
                <Link
                  href={`/course/${course.slug}`}
                  className="hover:text-primary text-primary/80 flex items-center gap-x-1 text-sm transition-all duration-200"
                >
                  <ChevronLeft className="size-4 shrink-0" />
                  <span className="font-medium">Back to {course?.title}</span>
                </Link>
              )}
            </div>
            <h1 className="hidden text-center text-sm font-medium capitalize sm:block sm:w-full">
              {topic?.title}
            </h1>
            <div className="sm:min-w-[200px]">
              <Link
                href={`/courses`}
                className="hover:text-primary text-primary/80 flex w-full items-center justify-end gap-x-1.5 text-sm transition-all duration-200"
              >
                <Home className="size-4 shrink-0" />
                <span className="font-medium">View Courses</span>
              </Link>
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto h-full w-full max-w-4xl flex-grow px-3 py-12 sm:px-6">
        {isLoading || isFetching ? (
          <div className="mx-auto flex h-full w-fit items-center justify-center gap-2">
            <Spinner className="size-6" />{" "}
            <span className="text-sm">Loading</span>
          </div>
        ) : !topic ? (
          "No quiz available"
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-0.5">
              {currentQuestion && (
                <ProgressBar
                  max={2.5}
                  type="discrete"
                  variant="danger"
                  value={Math.max(currentQuestion?.difficulty || 0, 0)}
                  label={{
                    render: (value) =>
                      `Difficulty: ${
                        value <= 0.5
                          ? "Easy"
                          : value > 0.5 && value <= 1.5
                            ? "Medium"
                            : "Hard"
                      }`,
                  }}
                />
              )}
              {typeof currentScorePercentage === "number" && (
                <ProgressBar
                  max={100}
                  type="continuous"
                  variant="success"
                  value={Math.max(currentScorePercentage, 0)}
                  label={{
                    render: (value) =>
                      `Performance: ${
                        value <= 40
                          ? "Poor"
                          : value >= 70
                            ? "Excellent"
                            : "Average"
                      }`,
                    position: "right",
                  }}
                />
              )}
              {/* {typeof currentTheta === "number" && (
                <ProgressBar
                  max={2.5}
                  type="discrete"
                  variant="success"
                  value={Math.max(currentTheta, 0)}
                  label={{
                    render: (value) =>
                      `Performance: ${
                        value < -1
                          ? "Poor"
                          : value > 1
                            ? "Excellent"
                            : "Average"
                      }`,
                    position: "right",
                  }}
                />
              )} */}
            </div>
            {quizState === "intro" && (
              <div className="space-y-6">
                <Card className="gap-0 p-5 sm:p-10">
                  <p className="mb-2.5 text-base font-semibold text-white">
                    {topic.description}
                  </p>
                  <p className="mb-6 text-sm text-neutral-100">
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

                <Card className="p-7 sm:p-10">
                  <h2 className="mb-4 text-base font-medium">
                    <pre className="text-wrap">
                      <code
                        dangerouslySetInnerHTML={{
                          __html: currentQuestion?.question || "",
                        }}
                      />
                      {/* <code dangerouslySetInnerHTML={{ __html: currentQuestion?.question || "" }}>{currentQuestion?.question}</code> */}
                    </pre>
                  </h2>

                  <RadioGroup
                    value={selectedAnswer || ""}
                    onValueChange={(value) => {
                      if (!isSubmitAnswerPending) {
                        handleAnswer(value);
                      }
                    }}
                    className="space-y-3"
                  >
                    {(currentQuestion?.options ?? [])
                      .filter((option) => option.text)
                      .map((option) => (
                        <div
                          role="button"
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
                            <span
                              dangerouslySetInnerHTML={{
                                __html: option.text || "",
                              }}
                            />
                            {/* {option.text} */}
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

                <Card className="p-7 sm:p-10">
                  <h2 className="mb-4 text-base font-medium">
                    <pre className="text-wrap">
                      <code
                        dangerouslySetInnerHTML={{
                          __html: currentQuestion?.question || "",
                        }}
                      />
                      {/* <code>{currentQuestion?.question}</code> */}
                    </pre>
                  </h2>

                  <div className="space-y-3">
                    {(currentQuestion?.options ?? [])
                      .filter((option) => option.text)
                      .map((option) => (
                        <div
                          key={option.id}
                          className={`flex items-center space-x-2 rounded-lg border p-4 ${
                            option.id.toUpperCase() ===
                            submitResponse?.correct_answer.toUpperCase()
                              ? "border-green-500 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
                              : option.id.toUpperCase() ===
                                  selectedAnswer?.toUpperCase()
                                ? option.id.toUpperCase() !==
                                  submitResponse?.correct_answer.toUpperCase()
                                  ? "border-red-500 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
                                  : "border-green-500 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
                                : ""
                          }`}
                        >
                          <div className="flex w-full items-center text-base">
                            <span className="mr-2 font-semibold">
                              {option.id.toUpperCase()}.
                            </span>{" "}
                            <span
                              dangerouslySetInnerHTML={{
                                __html: option.text || "",
                              }}
                            />
                            {/* {option.text} */}
                            {option.id === submitResponse?.correct_answer && (
                              <CheckCircle2 className="ml-auto h-5 w-5 text-green-500" />
                            )}
                            {option.id === selectedAnswer &&
                              option.id.toUpperCase() !==
                                submitResponse?.correct_answer.toUpperCase() && (
                                <AlertCircle className="ml-auto h-5 w-5 text-red-500" />
                              )}
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="bg-muted mb-6 rounded-lg p-4">
                    <h3 className="mb-2 font-semibold">Explanation:</h3>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: submitResponse?.explanation || "",
                      }}
                    />
                    {/* <p  dangerouslySetInnerHTML={{ __html: submitResponse?.explanation || "" }}>{submitResponse?.explanation}</p> */}
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
                <Card className="p-7 sm:p-10">
                  <h2 className="mb-4 text-2xl font-bold">
                    Your Score:{" "}
                    {(submitResponse?.result?.correct_ids ?? [])?.length} out of{" "}
                    {(submitResponse?.result?.administered ?? [])?.length}
                  </h2>
                  {/* <p className="mb-6">
                    XP Earned: {submitResponse?.result?.xp_earned ?? 0}
                  </p> */}
                  <div className="flex gap-3">
                    <Button size="lg" onClick={handleRetry}>
                      Try Again
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => {
                        setQuizState("intro");
                        setSubmitResponse(null);
                        setCurrentTheta(null);
                        setCurrentScorePercentage(null);
                      }}
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
