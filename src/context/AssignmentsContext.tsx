"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type {
  Homework,
  HomeworkSubmission,
  Quiz,
  QuizQuestion,
  QuizSubmission,
} from "@/types";
import { buildHomeworkFormData, type HomeworkFormData } from "@/components/teacher/HomeworkForm";
import { buildQuizPayload, type QuizFormData } from "@/components/teacher/QuizForm";
import {
  pickBestQuizSubmission,
  quizAttemptsForStudent,
} from "@/lib/quizAttempts";

type AssignmentsState = {
  homework: Homework[];
  quizzes: Quiz[];
  homeworkSubmissions: HomeworkSubmission[];
  quizSubmissions: QuizSubmission[];
};

type AssignmentsContextValue = AssignmentsState & {
  loading: boolean;
  getHomeworkByClass: (classId: string) => Homework[];
  getQuizzesByClass: (classId: string) => Quiz[];
  getHomeworkByTeacher: (teacherId: string, classIds: string[]) => Homework[];
  getQuizzesByTeacher: (teacherId: string, classIds: string[]) => Quiz[];
  addHomework: (data: HomeworkFormData) => Promise<Homework[]>;
  updateHomework: (id: string, data: HomeworkFormData, options?: { applyToGroup?: boolean }) => Promise<void>;
  deleteHomework: (id: string, options?: { group?: boolean }) => Promise<void>;
  addQuiz: (data: QuizFormData) => Promise<Quiz>;
  updateQuiz: (
    id: string,
    data: QuizFormData | Partial<Pick<Quiz, "gradesVisible" | "reviewAllowed" | "status">>,
    options?: { applyToGroup?: boolean }
  ) => Promise<void>;
  deleteQuiz: (id: string, options?: { group?: boolean }) => Promise<void>;
  submitHomework: (data: {
    homeworkId: string;
    studentId: string;
    content: string;
    attachment?: File | null;
  }) => Promise<HomeworkSubmission>;
  getHomeworkSubmission: (homeworkId: string, studentId: string) => HomeworkSubmission | undefined;
  getHomeworkSubmissions: (homeworkId: string) => HomeworkSubmission[];
  submitQuiz: (
    data: Omit<QuizSubmission, "id" | "submittedAt"> & { essayFiles?: Record<string, File | null> }
  ) => Promise<QuizSubmission>;
  getQuizSubmission: (quizId: string, studentId: string) => QuizSubmission | undefined;
  getQuizAttemptCount: (quizId: string, studentId: string) => number;
  getQuizSubmissions: (quizId: string) => QuizSubmission[];
  refresh: () => Promise<void>;
};

function normalizeQuiz(q: Quiz): Quiz {
  return {
    ...q,
    startAt: q.startAt ?? `${q.dueDate}T08:00:00`,
    endAt: q.endAt ?? null,
    durationMinutes: q.durationMinutes ?? 30,
    maxAttempts: q.maxAttempts ?? 1,
    questions: (q.questions ?? []).map((question) => ({
      ...question,
      questionType: question.questionType ?? "choice",
      points: question.points ?? 1,
      options: question.options ?? [],
      pairs: question.pairs ?? [],
      correctText: question.correctText ?? "",
    })),
  };
}

const AssignmentsContext = createContext<AssignmentsContextValue | null>(null);

export function AssignmentsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<AssignmentsState>({
    homework: [],
    quizzes: [],
    homeworkSubmissions: [],
    quizSubmissions: [],
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (user.role === "teacher") {
        const [homework, quizzes, assessments] = await Promise.all([
          api.getTeacherHomework(),
          api.getTeacherQuizzes(),
          api.getTeacherAssessments(),
        ]);
        const submissionRows = (assessments as Array<{ submissions: HomeworkSubmission[] }>).flatMap(
          (row) => row.submissions ?? []
        );
        setState((prev) => ({
          ...prev,
          homework: homework as Homework[],
          quizzes: (quizzes as Quiz[]).map(normalizeQuiz),
          homeworkSubmissions: submissionRows,
        }));
      } else if (user.role === "parent") {
        const [homework, quizzes, submissions] = await Promise.all([
          api.getParentHomework(),
          api.getParentQuizzes(),
          api.getParentSubmissions(),
        ]);
        const subs = submissions as { homework: HomeworkSubmission[]; quizzes: QuizSubmission[] };
        setState({
          homework: homework as Homework[],
          quizzes: (quizzes as Quiz[]).map(normalizeQuiz),
          homeworkSubmissions: subs.homework,
          quizSubmissions: subs.quizzes,
        });
      }
    } catch {
      setState({
        homework: [],
        quizzes: [],
        homeworkSubmissions: [],
        quizSubmissions: [],
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getHomeworkByClass = useCallback(
    (classId: string) =>
      state.homework
        .filter((h) => h.classId === classId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state.homework]
  );

  const getQuizzesByClass = useCallback(
    (classId: string) =>
      state.quizzes
        .filter((q) => q.classId === classId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state.quizzes]
  );

  const getHomeworkByTeacher = useCallback(
    (teacherId: string, classIds: string[]) =>
      state.homework
        .filter((h) => h.teacherId === teacherId && classIds.includes(h.classId))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state.homework]
  );

  const getQuizzesByTeacher = useCallback(
    (teacherId: string, classIds: string[]) =>
      state.quizzes
        .filter((q) => q.teacherId === teacherId && classIds.includes(q.classId))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state.quizzes]
  );

  const addHomework = useCallback(async (data: HomeworkFormData) => {
    const fd = buildHomeworkFormData(data);
    const result = await api.createTeacherHomework(fd);
    const items = (Array.isArray(result) ? result : [result]) as Homework[];
    setState((prev) => ({ ...prev, homework: [...items, ...prev.homework] }));
    return items;
  }, []);

  const updateHomework = useCallback(async (id: string, data: HomeworkFormData, options?: { applyToGroup?: boolean }) => {
    const initial = state.homework.find((h) => h.id === id);
    const fd = buildHomeworkFormData(data, initial, {
      applyToGroup: options?.applyToGroup,
      syncClasses: Boolean(data.classIds?.length),
    });
    await api.updateTeacherHomework(id, fd);
    await refresh();
  }, [state.homework, refresh]);

  const deleteHomework = useCallback(async (id: string, options?: { group?: boolean }) => {
    const target = state.homework.find((h) => h.id === id);
    await api.deleteTeacherHomework(id, options?.group);
    setState((prev) => {
      const removeIds = new Set<string>([id]);
      if (options?.group && target?.groupId) {
        for (const hw of prev.homework) {
          if (hw.groupId === target.groupId) removeIds.add(hw.id);
        }
      }
      return {
        ...prev,
        homework: prev.homework.filter((h) => !removeIds.has(h.id)),
        homeworkSubmissions: prev.homeworkSubmissions.filter((s) => !removeIds.has(s.homeworkId)),
      };
    });
  }, [state.homework]);

  const addQuiz = useCallback(async (data: QuizFormData) => {
    const payload = buildQuizPayload(data);
    const result = await api.createTeacherQuiz(payload);
    const items = (Array.isArray(result) ? result : [result]) as Quiz[];
    setState((prev) => ({
      ...prev,
      quizzes: [...items.map(normalizeQuiz), ...prev.quizzes],
    }));
    return items[0];
  }, []);

  const updateQuiz = useCallback(
    async (
      id: string,
      data: QuizFormData | Partial<Pick<Quiz, "gradesVisible" | "reviewAllowed" | "status">> & { applyToGroup?: boolean },
      options?: { applyToGroup?: boolean }
    ) => {
      let payload: Record<string, unknown>;
      if ("questions" in data && Array.isArray(data.questions)) {
        payload = buildQuizPayload(data as QuizFormData, {
          applyToGroup: options?.applyToGroup ?? data.applyToGroup,
          syncClasses: Boolean((data as QuizFormData).classIds?.length),
        });
      } else {
        payload = { ...data };
        if (options?.applyToGroup || data.applyToGroup) payload.applyToGroup = true;
      }
      await api.updateTeacherQuiz(id, payload);
      await refresh();
    },
    [refresh]
  );

  const deleteQuiz = useCallback(async (id: string, options?: { group?: boolean }) => {
    const target = state.quizzes.find((q) => q.id === id);
    await api.deleteTeacherQuiz(id, options?.group);
    setState((prev) => {
      const removeIds = new Set<string>([id]);
      if (options?.group && target?.groupId) {
        for (const quiz of prev.quizzes) {
          if (quiz.groupId === target.groupId) removeIds.add(quiz.id);
        }
      }
      return {
        ...prev,
        quizzes: prev.quizzes.filter((q) => !removeIds.has(q.id)),
        quizSubmissions: prev.quizSubmissions.filter((s) => !removeIds.has(s.quizId)),
      };
    });
  }, [state.quizzes]);

  const submitHomework = useCallback(
    async (data: {
      homeworkId: string;
      studentId: string;
      content: string;
      attachment?: File | null;
    }) => {
      const fd = new FormData();
      fd.append("homeworkId", data.homeworkId);
      fd.append("content", data.content);
      if (data.attachment) fd.append("attachment", data.attachment);
      const item = (await api.submitParentHomework(fd)) as HomeworkSubmission;
      setState((prev) => ({
        ...prev,
        homeworkSubmissions: [
          ...prev.homeworkSubmissions.filter(
            (s) => !(s.homeworkId === data.homeworkId && s.studentId === data.studentId)
          ),
          item,
        ],
      }));
      return item;
    },
    []
  );

  const getHomeworkSubmission = useCallback(
    (homeworkId: string, studentId: string) =>
      state.homeworkSubmissions.find(
        (s) => s.homeworkId === homeworkId && s.studentId === studentId
      ),
    [state.homeworkSubmissions]
  );

  const getHomeworkSubmissions = useCallback(
    (homeworkId: string) =>
      state.homeworkSubmissions.filter((s) => s.homeworkId === homeworkId),
    [state.homeworkSubmissions]
  );

  const submitQuiz = useCallback(
    async (
      data: Omit<QuizSubmission, "id" | "submittedAt"> & { essayFiles?: Record<string, File | null> }
    ) => {
      const fd = new FormData();
      fd.append("quizId", data.quizId);
      fd.append("answers", JSON.stringify(data.answers));
      fd.append("timeSpentSeconds", String(data.timeSpentSeconds));
      if (data.essayFiles) {
        for (const [questionId, file] of Object.entries(data.essayFiles)) {
          if (file) fd.append(`essayFile_${questionId}`, file);
        }
      }
      const item = (await api.submitParentQuiz(fd)) as QuizSubmission;
      setState((prev) => ({
        ...prev,
        quizSubmissions: [...prev.quizSubmissions, item],
        quizzes: prev.quizzes.map((q) =>
          q.id === data.quizId
            ? {
                ...q,
                attemptCount:
                  item.attemptsUsed ??
                  quizAttemptsForStudent(prev.quizSubmissions, data.quizId, data.studentId)
                    .length + 1,
                attemptsRemaining:
                  item.attemptsRemaining ??
                  Math.max(
                    0,
                    (q.maxAttempts ?? 1) -
                      quizAttemptsForStudent(prev.quizSubmissions, data.quizId, data.studentId)
                        .length -
                      1
                  ),
                canRetake: (item.attemptsRemaining ?? 0) > 0,
              }
            : q
        ),
      }));
      return item;
    },
    []
  );

  const getQuizSubmission = useCallback(
    (quizId: string, studentId: string) =>
      pickBestQuizSubmission(
        quizAttemptsForStudent(state.quizSubmissions, quizId, studentId)
      ),
    [state.quizSubmissions]
  );

  const getQuizAttemptCount = useCallback(
    (quizId: string, studentId: string) =>
      quizAttemptsForStudent(state.quizSubmissions, quizId, studentId).length,
    [state.quizSubmissions]
  );

  const getQuizSubmissions = useCallback(
    (quizId: string) => state.quizSubmissions.filter((s) => s.quizId === quizId),
    [state.quizSubmissions]
  );

  return (
    <AssignmentsContext.Provider
      value={{
        ...state,
        loading,
        getHomeworkByClass,
        getQuizzesByClass,
        getHomeworkByTeacher,
        getQuizzesByTeacher,
        addHomework,
        updateHomework,
        deleteHomework,
        addQuiz,
        updateQuiz,
        deleteQuiz,
        submitHomework,
        getHomeworkSubmission,
        getHomeworkSubmissions,
        submitQuiz,
        getQuizSubmission,
        getQuizAttemptCount,
        getQuizSubmissions,
        refresh,
      }}
    >
      {children}
    </AssignmentsContext.Provider>
  );
}

export function useAssignments() {
  const ctx = useContext(AssignmentsContext);
  if (!ctx) throw new Error("useAssignments must be used within AssignmentsProvider");
  return ctx;
}

export type { QuizQuestion };
