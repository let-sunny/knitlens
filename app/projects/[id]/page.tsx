export const metadata = {
  title: "프로젝트 | KnitLens",
  description: "Project tracker.",
};

import { getProjectById } from "@/lib/supabase/projects";
import { getLatestPatternByProjectId } from "@/lib/supabase/patterns";
import {
  getProgressByProjectId,
  createProgressForProject,
} from "@/lib/supabase/progress";
import { TrackerView, type SectionShape } from "./TrackerView";

type Props = { params: Promise<{ id: string }> };

export default async function ProjectPage({ params }: Props) {
  const { id: projectId } = await params;

  const project = await getProjectById(projectId);
  if (!project) {
    return (
      <main className="min-h-screen p-6">
        <div className="window" style={{ maxWidth: "32rem" }}>
          <div className="title-bar">
            <span className="title">Project Tracker</span>
          </div>
          <div className="window-pane" style={{ padding: "1rem 1.5rem" }}>
            <p>프로젝트를 찾을 수 없습니다.</p>
          </div>
        </div>
      </main>
    );
  }

  if (project.status !== "compiled") {
    return (
      <main className="min-h-screen p-6">
        <div className="window" style={{ maxWidth: "32rem" }}>
          <div className="title-bar">
            <span className="title">Project Tracker</span>
          </div>
          <div className="window-pane" style={{ padding: "1rem 1.5rem" }}>
            <p>아직 트래커를 사용할 수 없습니다. 패턴 분석과 명확화를 먼저 완료해 주세요.</p>
          </div>
        </div>
      </main>
    );
  }

  const pattern = await getLatestPatternByProjectId(projectId);
  if (!pattern) {
    return (
      <main className="min-h-screen p-6">
        <div className="window" style={{ maxWidth: "32rem" }}>
          <div className="title-bar">
            <span className="title">Project Tracker</span>
          </div>
          <div className="window-pane" style={{ padding: "1rem 1.5rem" }}>
            <p>패턴을 찾을 수 없습니다.</p>
          </div>
        </div>
      </main>
    );
  }

  let progress = await getProgressByProjectId(projectId);
  if (!progress) {
    progress = await createProgressForProject(projectId, pattern);
  }

  const sections = pattern.sections as SectionShape[];

  return (
    <main
      style={{
        height: "100vh",
        overflow: "hidden",
        padding: "1.5rem",
        boxSizing: "border-box",
      }}
    >
      <div
        className="window"
        style={{
          maxWidth: "64rem",
          width: "100%",
          height: "100%",
          maxHeight: "calc(100vh - 3rem)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div className="title-bar">
          <span className="title">KnitTracker - {project.title}</span>
        </div>
        <div
          className="window-pane"
          style={{
            padding: 0,
            minHeight: 0,
            flex: 1,
            overflow: "hidden",
          }}
        >
          <TrackerView
            projectId={projectId}
            projectTitle={project.title}
            sections={sections}
            progress={{
              currentSectionId: progress.current_section_id,
              currentRowId: progress.current_row_id,
              currentStepId: progress.current_step_id,
              steps: progress.steps,
            }}
          />
        </div>
      </div>
    </main>
  );
}
