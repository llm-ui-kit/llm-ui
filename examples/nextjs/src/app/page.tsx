export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-4 p-24">
      <p className="text-2xl mb-4">Examples:</p>
      <a href="/examples/markdown">Markdown</a>
      <a href="/examples/code-block">Code blocks</a>
      <a href="/examples/buttons">Buttons</a>
      <a href="/examples/openai">Openai</a>
    </main>
  );
}
