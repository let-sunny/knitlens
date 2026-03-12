import { NewProjectForm } from "./NewProjectForm";

export const metadata = {
  title: "새 프로젝트 | KnitLens",
  description: "Create a new knitting project from a pattern PDF.",
};

export default function NewProjectPage() {
  return (
    <main className="min-h-screen p-6 flex flex-col items-center">
      <h1 className="text-xl font-bold mb-6">새 프로젝트</h1>
      <NewProjectForm />
    </main>
  );
}
