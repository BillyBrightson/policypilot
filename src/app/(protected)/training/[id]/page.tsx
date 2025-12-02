"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getTrainingModule, createTrainingCompletion } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import type { TrainingModule, QuizQuestion } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProtectedLayout from "@/components/protected-layout";
import { ArrowLeft, CheckCircle, XCircle, Award, PlayCircle } from "lucide-react";
import Link from "next/link";

export default function TrainingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, tenant, loading: authLoading } = useAuth();
  const [module, setModule] = useState<TrainingModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && params.id) {
      loadModule();
    }
  }, [params.id, authLoading]);

  const loadModule = async () => {
    try {
      setLoading(true);
      const moduleData = await getTrainingModule(params.id as string);
      setModule(moduleData);
    } catch (error) {
      console.error("Error loading module:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleSubmitQuiz = async () => {
    if (!module || !user || !tenant) return;

    setSubmitting(true);
    try {
      // Calculate score
      let correctAnswers = 0;
      module.quizQuestions.forEach((question) => {
        if (answers[question.id] === question.correctAnswerIndex) {
          correctAnswers++;
        }
      });

      const score = Math.round((correctAnswers / module.quizQuestions.length) * 100);
      const passed = score >= 70;

      // Save completion
      const certificateId = passed ? `CERT-${Date.now()}-${user.uid}` : null;
      await createTrainingCompletion({
        tenantId: tenant.id,
        moduleId: module.id,
        userId: user.uid,
        score,
        passed,
        completedAt: new Date(),
        certificateUrl: certificateId,
      });

      setShowResults(true);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const calculateScore = () => {
    if (!module) return 0;
    let correctAnswers = 0;
    module.quizQuestions.forEach((question) => {
      if (answers[question.id] === question.correctAnswerIndex) {
        correctAnswers++;
      }
    });
    return Math.round((correctAnswers / module.quizQuestions.length) * 100);
  };

  if (authLoading || loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading training module...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (!module) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Module not found</p>
            <Link href="/training">
              <Button variant="outline">Back to Training</Button>
            </Link>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  const currentQuizQuestion = module.quizQuestions[currentQuestion];
  const allQuestionsAnswered = module.quizQuestions.every((q) => answers[q.id] !== undefined);

  return (
    <ProtectedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/training">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Training
          </Button>
        </Link>

        {!showQuiz && !showResults && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{module.title}</CardTitle>
                <CardDescription>{module.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-6">{module.description}</p>

                {/* Video Placeholder */}
                <div className="bg-muted rounded-lg aspect-video flex items-center justify-center mb-6">
                  <div className="text-center">
                    <PlayCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Video content will be displayed here</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Estimated time: {module.estimatedMinutes} minutes
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setShowQuiz(true)} size="lg">
                    Continue to Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {showQuiz && !showResults && (
          <Card>
            <CardHeader>
              <CardTitle>
                Quiz: Question {currentQuestion + 1} of {module.quizQuestions.length}
              </CardTitle>
              <CardDescription>{currentQuizQuestion.question}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentQuizQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuizQuestion.id, index)}
                  className={`w-full text-left p-4 rounded-md border-2 transition-colors ${
                    answers[currentQuizQuestion.id] === index
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {option}
                </button>
              ))}

              <div className="flex justify-between gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                {currentQuestion < module.quizQuestions.length - 1 ? (
                  <Button
                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    disabled={answers[currentQuizQuestion.id] === undefined}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={!allQuestionsAnswered || submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Quiz"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {showResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {calculateScore() >= 70 ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    Training Complete!
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-red-600" />
                    Quiz Not Passed
                  </>
                )}
              </CardTitle>
              <CardDescription>
                Your score: {calculateScore()}%
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-6">
                <div className="text-5xl font-bold mb-2">{calculateScore()}%</div>
                {calculateScore() >= 70 ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Award className="h-5 w-5" />
                    <span className="font-medium">Certificate Earned!</span>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    You need 70% to pass. Review the module and try again.
                  </p>
                )}
              </div>

              {/* Review Answers */}
              <div className="space-y-4">
                <h3 className="font-semibold">Review Your Answers</h3>
                {module.quizQuestions.map((question, qIndex) => {
                  const userAnswer = answers[question.id];
                  const isCorrect = userAnswer === question.correctAnswerIndex;

                  return (
                    <div key={question.id} className="p-4 rounded-md border">
                      <div className="flex items-start gap-2 mb-2">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium mb-2">{question.question}</p>
                          <div className="space-y-1 text-sm">
                            <p className={isCorrect ? "text-green-600" : "text-red-600"}>
                              Your answer: {question.options[userAnswer]}
                            </p>
                            {!isCorrect && (
                              <p className="text-green-600">
                                Correct answer: {question.options[question.correctAnswerIndex]}
                              </p>
                            )}
                            {question.explanation && (
                              <p className="text-muted-foreground mt-2">{question.explanation}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-4">
                <Link href="/training">
                  <Button variant="outline">Back to Training</Button>
                </Link>
                {calculateScore() < 70 && (
                  <Button onClick={() => {
                    setShowQuiz(true);
                    setShowResults(false);
                    setCurrentQuestion(0);
                    setAnswers({});
                  }}>
                    Retake Quiz
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedLayout>
  );
}

