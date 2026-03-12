export const metadata = {
  title: "명확화 | KnitLens",
  description: "Answer clarification questions (placeholder).",
};

import { getProjectById } from "@/lib/supabase/projects";
import { ClarifyForm } from "./ClarifyForm";
import { createServerSupabase } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

async function getLatestPatternIdForProject(
  projectId: string
): Promise<string | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("patterns")
    .select("id")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

async function getClarificationQuestions(patternId: string) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("clarification_questions")
    .select("id, text, type, options")
    .eq("pattern_id", patternId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    text: row.text as string,
    type: row.type as "choice" | "number" | "text",
    options: (row.options ?? null) as string[] | null,
  }));
}

export default async function ClarifyPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) {
    return (
      <main className="min-h-screen p-6">
        <div className="window" style={{ maxWidth: "32rem" }}>
          <div className="title-bar">
            <span className="title">Clarification</span>
          </div>
          <div className="window-pane" style={{ padding: "1rem 1.5rem" }}>
            <p>프로젝트를 찾을 수 없습니다.</p>
          </div>
        </div>
      </main>
    );
  }

  const patternId =
    (await getLatestPatternIdForProject(project.id)) ?? null;

  if (!patternId) {
    return (
      <main className="min-h-screen p-6">
        <div className="window" style={{ maxWidth: "32rem" }}>
          <div className="title-bar">
            <span className="title">Clarification</span>
          </div>
          <div className="window-pane" style={{ padding: "1rem 1.5rem" }}>
            <p>이 프로젝트에 대한 패턴이 아직 생성되지 않았습니다.</p>
          </div>
        </div>
      </main>
    );
  }

  const questions = await getClarificationQuestions(patternId);

  return (
    <main className="min-h-screen p-6">
      <div className="window" style={{ maxWidth: "32rem" }}>
        <div className="title-bar">
          <span className="title">Clarification</span>
        </div>
        <div className="window-pane" style={{ padding: "1rem 1.5rem" }}>
          <h1 className="mb-3 text-base font-bold">{project.title}</h1>
          {questions.length === 0 ? (
            <p className="text-sm">
              이 프로젝트에 대한 추가 명확화 질문이 없습니다.
            </p>
          ) : (
            <ClarifyForm
              projectId={project.id}
              patternId={patternId}
              initialQuestions={questions}
            />
          )}
        </div>
      </div>
    </main>
  );
}
