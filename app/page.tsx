import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center">
      <h1 className="text-xl font-bold mb-4">KnitLens</h1>
      <p className="text-center mb-6 max-w-md">
        AI-assisted knitting pattern interpreter that turns messy pattern PDFs
        into structured, trackable steps.
      </p>
      <Link href="/projects/new" className="btn">
        새 프로젝트 만들기
      </Link>
    </main>
  );
}
