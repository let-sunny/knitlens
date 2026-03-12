export const metadata = {
  title: "프로젝트 | KnitLens",
  description: "Project tracker (placeholder).",
};

type Props = { params: Promise<{ id: string }> };

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  return (
    <main className="min-h-screen p-6">
      <div className="window" style={{ maxWidth: "32rem" }}>
        <div className="title-bar">
          <span className="title">Project Tracker</span>
        </div>
        <div className="window-pane" style={{ padding: "1rem 1.5rem" }}>
          <p>
            프로젝트 <code>{id}</code> 트래커 화면 (플레이스홀더).
          </p>
          <p className="mt-2 text-sm text-gray-600">
            후속 스펙에서 단계별 진행 UI가 구현됩니다.
          </p>
        </div>
      </div>
    </main>
  );
}
