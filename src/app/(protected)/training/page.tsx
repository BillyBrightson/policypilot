"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getTrainingModules, getTrainingCompletionsByUser } from "@/lib/db";
import type { TrainingModule, TrainingCompletion } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtectedLayout from "@/components/protected-layout";
import Link from "next/link";
import { GraduationCap, Clock, CheckCircle, PlayCircle, Award } from "lucide-react";

export default function TrainingPage() {
  const router = useRouter();
  const { user, tenant, loading: authLoading } = useAuth();
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [completions, setCompletions] = useState<TrainingCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && tenant) {
      loadTrainingData();
    }
  }, [tenant, authLoading, user]);

  const loadTrainingData = async () => {
    if (!tenant || !user) return;

    try {
      setLoading(true);
      const modulesList = await getTrainingModules(tenant.id);
      setModules(modulesList);

      const completionsList = await getTrainingCompletionsByUser(user.uid, tenant.id);
      setCompletions(completionsList);
    } catch (error) {
      console.error("Error loading training data:", error);
    } finally {
      setLoading(false);
    }
  };

  const isModuleCompleted = (moduleId: string) => {
    return completions.some((c) => c.moduleId === moduleId && c.passed);
  };

  const getModuleCompletion = (moduleId: string) => {
    return completions.find((c) => c.moduleId === moduleId);
  };

  if (authLoading || loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading training modules...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Training</h1>
          <p className="text-muted-foreground">
            Complete training modules to earn certificates and improve compliance knowledge
          </p>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Modules</TabsTrigger>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {modules.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Training Modules Available</h3>
                    <p className="text-sm text-muted-foreground">
                      Training modules will be available soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((module) => {
                  const completed = isModuleCompleted(module.id);
                  const completion = getModuleCompletion(module.id);

                  return (
                    <Card key={module.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <GraduationCap className="h-8 w-8 text-primary" />
                          {completed && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-5 w-5" />
                              <span className="text-xs font-medium">Complete</span>
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <CardDescription>{module.category}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {module.description}
                        </p>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{module.estimatedMinutes} min</span>
                          </div>
                          {completion && (
                            <div className="text-sm font-medium">
                              Score: {completion.score}%
                            </div>
                          )}
                        </div>
                        <Link href={`/training/${module.id}`}>
                          <Button className="w-full" variant={completed ? "outline" : "default"}>
                            {completed ? (
                              <>
                                <Award className="mr-2 h-4 w-4" />
                                Review Module
                              </>
                            ) : (
                              <>
                                <PlayCircle className="mr-2 h-4 w-4" />
                                Start Training
                              </>
                            )}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            {completions.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Completed Training Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start a training module to see your progress here
                    </p>
                    <Link href="/training">
                      <Button>Browse Modules</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completions.map((completion) => {
                  const module = modules.find((m) => m.id === completion.moduleId);
                  if (!module) return null;

                  return (
                    <Card key={completion.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {completion.passed ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <Clock className="h-5 w-5 text-yellow-600" />
                              )}
                              {module.title}
                            </CardTitle>
                            <CardDescription>
                              Completed on {new Date(completion.completedAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{completion.score}%</div>
                            <div className="text-sm text-muted-foreground">Score</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            {completion.passed ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <Award className="h-4 w-4" />
                                <span className="text-sm font-medium">Certificate Earned</span>
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                Score below passing threshold (70%)
                              </div>
                            )}
                          </div>
                          <Link href={`/training/${module.id}`}>
                            <Button variant="outline" size="sm">
                              Review
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  );
}



