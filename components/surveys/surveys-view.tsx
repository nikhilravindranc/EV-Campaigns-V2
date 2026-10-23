"use client";

import { useState } from "react";
import { ChartBarHorizontalIcon, ClipboardTextIcon, CopyIcon, PlusIcon, TrashIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Badge, Card, ConfirmDialog, fieldClass, OutlineButton, PageHeading, PageShell, PrimaryButton } from "@/components/shared/campaign-ui";
import { EmptyState } from "@/components/shared/state-panels";
import { useHydrated } from "@/hooks/use-hydrated";
import { useStoredState } from "@/hooks/use-stored-state";
import { demoNow } from "@/lib/api/store";
import { formatDate, formatNumber } from "@/lib/format";
import { newQuestion, newQuestionId, newSurveyId, QUESTION_LABEL, sampleResults, SEED_SURVEYS, SURVEY_TEMPLATES, SURVEYS_KEY, validateSurvey, type QuestionType, type Survey, type SurveyQuestion } from "@/lib/surveys";
import { cn } from "@/lib/utils";

export function SurveysView() {
  const hydrated = useHydrated();
  const [stored, setStored] = useStoredState<Survey[]>(SURVEYS_KEY, SEED_SURVEYS);
  const surveys = hydrated ? stored : SEED_SURVEYS;
  const [editing, setEditing] = useState<Survey | "new" | null>(null);
  const [deleting, setDeleting] = useState<Survey | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);

  const save = (s: Survey) => {
    setStored(surveys.some((x) => x.id === s.id) ? surveys.map((x) => (x.id === s.id ? s : x)) : [s, ...surveys]);
    setEditing(null);
    toast.success("Survey saved", { description: `${s.name} · ${s.status === "live" ? "live, share the link to collect answers" : "saved as a draft"}` });
  };
  const copyLink = async (s: Survey) => {
    try {
      await navigator.clipboard.writeText(`https://evoq.one/survey/${s.id}`);
      toast.success("Survey link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <PageShell>
      <PageHeading
        crumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Surveys" }]}
        title="Surveys"
        description="Ask your contacts short questions and see the answers. Results here are sample data."
        actions={
          <PrimaryButton icon={PlusIcon} onClick={() => setEditing("new")}>
            Create survey
          </PrimaryButton>
        }
      />
      {surveys.length === 0 ? (
        <Card className="mt-5" label="Surveys">
          <EmptyState icon={ClipboardTextIcon} title="No surveys yet" hint="Start from a template, or write your own questions." action={<PrimaryButton icon={PlusIcon} onClick={() => setEditing("new")}>Create survey</PrimaryButton>} />
        </Card>
      ) : (
        <ul className="mt-5 grid gap-4">
          {surveys.map((s) => (
            <li key={s.id}>
              <Card label={s.name}>
                <div className="flex flex-wrap items-start gap-x-4 gap-y-2 p-5">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-campaign-tint text-campaign-action" aria-hidden>
                    <ClipboardTextIcon size={20} />
                  </span>
                  <div className="min-w-0 flex-1 basis-[220px]">
                    <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-ink">
                      {s.name}
                      <Badge fg={s.status === "live" ? "var(--success)" : "var(--neutral-fg)"} bg={s.status === "live" ? "var(--success-bg)" : "var(--neutral-bg)"} dot>
                        {s.status === "live" ? "Live" : "Draft"}
                      </Badge>
                    </p>
                    <p className="text-[12.5px] text-ink-muted">
                      {s.questions.length} {s.questions.length === 1 ? "question" : "questions"} · {formatNumber(s.responses)} responses · created {formatDate(s.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <OutlineButton icon={ChartBarHorizontalIcon} onClick={() => setViewing(viewing === s.id ? null : s.id)} aria-expanded={viewing === s.id}>
                      {viewing === s.id ? "Hide results" : "Results"}
                    </OutlineButton>
                    <OutlineButton icon={CopyIcon} onClick={() => copyLink(s)}>
                      Copy link
                    </OutlineButton>
                    <OutlineButton onClick={() => setEditing(s)}>Edit</OutlineButton>
                    <OutlineButton icon={TrashIcon} onClick={() => setDeleting(s)} aria-label={`Delete ${s.name}`}>
                      Delete
                    </OutlineButton>
                  </div>
                </div>
                {viewing === s.id && <Results survey={s} />}
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="flex max-h-[min(820px,calc(100dvh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          {editing && <SurveyEditor key={editing === "new" ? "new" : editing.id} survey={editing === "new" ? null : editing} onSave={save} />}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete this survey?"
        description="Its questions and responses are removed. The link stops working."
        confirmLabel="Delete survey"
        onConfirm={() => {
          if (deleting) setStored(surveys.filter((x) => x.id !== deleting.id));
          setDeleting(null);
        }}
      />
    </PageShell>
  );
}

function Results({ survey }: { survey: Survey }) {
  return (
    <div className="space-y-5 border-t border-line-soft bg-campaign-muted px-5 py-4">
      {survey.questions.map((q, i) => {
        const r = sampleResults(survey.id, q, survey.responses);
        return (
          <section key={q.id} aria-label={`Question ${i + 1} results`}>
            <h3 className="text-[13.5px] font-medium text-ink">
              {i + 1}. {q.text}
            </h3>
            {q.type === "text" ? (
              <ul className="mt-2 space-y-1.5">
                {(r as string[]).map((t) => (
                  <li key={t} className="rounded-lg bg-white px-3 py-2 text-[13px] text-ink-body ring-1 ring-line-soft">
                    “{t}”
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {(r as { label: string; share: number }[]).map((x) => (
                  <li key={x.label} className="grid grid-cols-[110px_minmax(0,1fr)_40px] items-center gap-2 text-[12.5px] text-ink-body">
                    <span className="truncate">{q.type === "rating" ? `${x.label} ${x.label === "1" ? "star" : "stars"}` : x.label}</span>
                    <span className="h-2 overflow-hidden rounded-full bg-white ring-1 ring-line-soft">
                      <span className="block h-full rounded-full bg-campaign-action" style={{ width: `${x.share}%` }} />
                    </span>
                    <span className="text-right tabular-nums">{x.share}%</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function SurveyEditor({ survey, onSave }: { survey: Survey | null; onSave: (s: Survey) => void }) {
  const [name, setName] = useState(survey?.name ?? "");
  const [questions, setQuestions] = useState<SurveyQuestion[]>(() => (survey ? survey.questions.map((q) => ({ ...q, options: q.options ? [...q.options] : undefined })) : []));
  const [error, setError] = useState("");

  const patchQ = (id: string, p: Partial<SurveyQuestion>) => (setQuestions(questions.map((q) => (q.id === id ? { ...q, ...p } : q))), setError(""));
  const fromTemplate = (t: (typeof SURVEY_TEMPLATES)[number]) => {
    setName(name || t.name);
    setQuestions(t.questions.map((q) => ({ ...q, id: newQuestionId(), options: q.options ? [...q.options] : undefined })));
    setError("");
  };
  const submit = (status: Survey["status"]) => {
    const draft = { name, questions };
    const problem = validateSurvey(draft);
    if (problem) return setError(problem);
    onSave({ id: survey?.id ?? newSurveyId(), name: name.trim(), status, questions: questions.map((q) => ({ ...q, text: q.text.trim(), options: q.options?.map((o) => o.trim()).filter(Boolean) })), responses: survey?.responses ?? 0, createdAt: survey?.createdAt ?? demoNow() });
  };

  return (
    <>
      <div className="border-b border-line-soft px-5 pt-5 pb-4 pr-12">
        <DialogTitle className="text-[17px] font-semibold text-ink">{survey ? "Edit survey" : "Create a survey"}</DialogTitle>
        <DialogDescription className="mt-0.5 text-[13px] text-ink-muted">Short surveys get more answers. Three questions or fewer works best.</DialogDescription>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 scrollbar-thin">
        {!survey && questions.length === 0 && (
          <div>
            <p className="text-[13px] font-medium text-ink">Start from a template</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {SURVEY_TEMPLATES.map((t) => (
                <button key={t.id} type="button" onClick={() => fromTemplate(t)} className="rounded-lg border border-line bg-white px-3 py-1.5 text-[12.5px] font-medium text-ink hover:border-brand-soft focus-visible:outline-2 focus-visible:outline-brand-action">
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="grid gap-1">
          <label htmlFor="sv-name" className="text-[13px] font-medium text-ink">
            Survey name
          </label>
          <input id="sv-name" value={name} onChange={(e) => (setName(e.target.value), setError(""))} maxLength={80} placeholder="e.g. Customer satisfaction" className={fieldClass} />
        </div>
        <ol className="space-y-3">
          {questions.map((q, i) => (
            <li key={q.id} className="rounded-xl border border-line p-3.5">
              <div className="flex items-center gap-2">
                <span className="text-[12.5px] font-semibold text-ink-muted">Question {i + 1}</span>
                <span className="rounded-md bg-campaign-muted px-1.5 py-0.5 text-[11.5px] text-ink-body">{QUESTION_LABEL[q.type]}</span>
                <button type="button" onClick={() => (setQuestions(questions.filter((x) => x.id !== q.id)), setError(""))} aria-label={`Remove question ${i + 1}`} className="ml-auto inline-flex size-7 items-center justify-center rounded-md text-ink-muted hover:bg-[var(--danger-bg)] hover:text-[#B42318]">
                  <TrashIcon size={14} aria-hidden />
                </button>
              </div>
              <input aria-label={`Question ${i + 1} text`} value={q.text} onChange={(e) => patchQ(q.id, { text: e.target.value })} maxLength={140} placeholder="Type your question" className={cn(fieldClass, "mt-2")} />
              {q.type === "choice" && (
                <div className="mt-2 space-y-1.5">
                  {(q.options ?? []).map((o, oi) => (
                    <div key={oi} className="flex items-center gap-1.5">
                      <input aria-label={`Question ${i + 1} answer ${oi + 1}`} value={o} onChange={(e) => patchQ(q.id, { options: (q.options ?? []).map((x, xi) => (xi === oi ? e.target.value : x)) })} maxLength={60} placeholder={`Answer ${oi + 1}`} className={fieldClass} />
                      {(q.options ?? []).length > 2 && (
                        <button type="button" onClick={() => patchQ(q.id, { options: (q.options ?? []).filter((_, xi) => xi !== oi) })} aria-label={`Remove answer ${oi + 1}`} className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-ink-muted hover:bg-campaign-muted">
                          <XIcon size={13} aria-hidden />
                        </button>
                      )}
                    </div>
                  ))}
                  {(q.options ?? []).length < 6 && (
                    <button type="button" onClick={() => patchQ(q.id, { options: [...(q.options ?? []), ""] })} className="text-[12.5px] font-medium text-brand hover:text-brand-press">
                      + Add an answer
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ol>
        {questions.length < 8 && (
          <div className="flex flex-wrap gap-2">
            {(Object.keys(QUESTION_LABEL) as QuestionType[]).map((t) => (
              <OutlineButton key={t} icon={PlusIcon} onClick={() => (setQuestions([...questions, newQuestion(t)]), setError(""))}>
                {QUESTION_LABEL[t]}
              </OutlineButton>
            ))}
          </div>
        )}
        {error && (
          <p role="alert" className="text-[12.5px] font-medium text-[#D92D20]">
            {error}
          </p>
        )}
      </div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-line-soft bg-campaign-muted px-5 py-3">
        <OutlineButton onClick={() => submit("draft")}>Save draft</OutlineButton>
        <PrimaryButton onClick={() => submit("live")}>Publish</PrimaryButton>
      </div>
    </>
  );
}
