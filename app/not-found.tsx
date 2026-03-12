import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center">
      <h1 className="text-xl font-bold mb-2">404</h1>
      <p className="mb-4">페이지를 찾을 수 없습니다.</p>
      <Link href="/" className="btn">
        홈으로
      </Link>
    </main>
  );
}
