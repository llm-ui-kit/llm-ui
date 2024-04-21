export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-4 p-24">
      <p className="text-2xl mb-4">Examples:</p>
      <a href="/examples/basic">Basic</a>
      <a href="/examples/code-block-all-themes">Code blocks with Shiki</a>
      <a href="/examples/buttons">Buttons</a>
    </main>
  );
}
