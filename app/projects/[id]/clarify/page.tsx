export const metadata = {
  title: "명확화 | KnitLens",
  description: "Answer clarification questions (placeholder).",
};

type Props = { params: Promise<{ id: string }> };

export default async function ClarifyPage({ params }: Props) {
  const { id } = await params;
  return (
    <main className="min-h-screen p-6">
      <div className="window" style={{ maxWidth: "32rem" }}>
        <div className="title-bar">
          <span className="title">Clarification</span>
        </div>
        <div className="window-pane" style={{ padding: "1rem 1.5rem" }}>
          <p>
            프로젝트 <code>{id}</code> 명확화 질문 (플레이스홀더).
          </p>
          <p className="mt-2 text-sm text-gray-600">
            후속 스펙에서 질문/답변 UI가 구현됩니다.
          </p>
        </div>
      </div>
    </main>
  );
}
