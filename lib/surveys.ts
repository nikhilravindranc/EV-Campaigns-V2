import { hash } from "@/lib/mock-data/campaigns";

export type QuestionType = "rating" | "choice" | "text";

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  text: string;
  /** Answers for a multiple-choice question. */
  options?: string[];
}

export interface Survey {
  id: string;
  name: string;
  status: "draft" | "live";
  questions: SurveyQuestion[];
  /** Responses so far (sample numbers in this demo). */
  responses: number;
  createdAt: string;
}

export const SURVEYS_KEY = "evoq-campaigns:surveys";

let n = 0;
export const newQuestionId = () => `q-${Date.now().toString(36)}-${++n}`;
export const newSurveyId = () => `sv-${Date.now().toString(36)}`;

export const QUESTION_LABEL: Record<QuestionType, string> = { rating: "Rating (1 to 5)", choice: "Multiple choice", text: "Written answer" };

export function newQuestion(type: QuestionType): SurveyQuestion {
  return { id: newQuestionId(), type, text: "", ...(type === "choice" ? { options: ["", ""] } : {}) };
}

export const SURVEY_TEMPLATES: { id: string; name: string; questions: Omit<SurveyQuestion, "id">[] }[] = [
  {
    id: "satisfaction",
    name: "Customer satisfaction",
    questions: [
      { type: "rating", text: "How satisfied are you with your recent purchase?" },
      { type: "choice", text: "What mattered most to you?", options: ["Price", "Quality", "Delivery speed", "Support"] },
      { type: "text", text: "Anything we could do better?" },
    ],
  },
  {
    id: "source",
    name: "Where did you hear about us?",
    questions: [{ type: "choice", text: "How did you first hear about us?", options: ["Search", "Social media", "A friend", "Email", "Other"] }],
  },
  {
    id: "event",
    name: "Post-event feedback",
    questions: [
      { type: "rating", text: "How would you rate the event?" },
      { type: "text", text: "What should we cover next time?" },
    ],
  },
];

export const SEED_SURVEYS: Survey[] = [
  {
    id: "sv-seed-1",
    name: "Post-purchase satisfaction",
    status: "live",
    responses: 214,
    createdAt: "2025-04-22T10:00:00",
    questions: [
      { id: "q1", type: "rating", text: "How satisfied are you with your recent purchase?" },
      { id: "q2", type: "choice", text: "What mattered most to you?", options: ["Price", "Quality", "Delivery speed", "Support"] },
      { id: "q3", type: "text", text: "Anything we could do better?" },
    ],
  },
  {
    id: "sv-seed-2",
    name: "Where did you hear about us?",
    status: "live",
    responses: 96,
    createdAt: "2025-05-02T09:30:00",
    questions: [{ id: "q1", type: "choice", text: "How did you first hear about us?", options: ["Search", "Social media", "A friend", "Email", "Other"] }],
  },
];

/** Sample results for a question, the same every time for the same survey. */
export function sampleResults(surveyId: string, q: SurveyQuestion, responses: number): { label: string; share: number }[] | string[] {
  const seed = hash(`${surveyId}:${q.id}`);
  if (q.type === "text") return ["Faster delivery to my area, please.", "Love the product. More colour options would be great.", "Support answered quickly. Thank you!"].slice(0, 1 + (seed % 3));
  const labels = q.type === "rating" ? ["1", "2", "3", "4", "5"] : (q.options ?? []).filter(Boolean);
  const weights = labels.map((_, i) => (q.type === "rating" ? [3, 5, 12, 34, 46][i] : 10 + ((seed >>> (i * 3)) % 30)) * (0.85 + ((seed >>> i) % 30) / 100));
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  void responses;
  const shares = weights.map((w) => Math.round((w / total) * 100));
  const top = shares.indexOf(Math.max(...shares));
  shares[top] += 100 - shares.reduce((x, y) => x + y, 0);
  return labels.map((label, i) => ({ label, share: shares[i] }));
}

export function validateSurvey(s: Pick<Survey, "name" | "questions">): string | null {
  if (s.name.trim().length < 3) return "Give the survey a name (at least 3 characters)";
  if (s.questions.length === 0) return "Add at least one question";
  for (const [i, q] of s.questions.entries()) {
    if (q.text.trim().length < 3) return `Question ${i + 1}: enter the question`;
    if (q.type === "choice" && (q.options ?? []).filter((o) => o.trim()).length < 2) return `Question ${i + 1}: add at least two answers`;
  }
  return null;
}
