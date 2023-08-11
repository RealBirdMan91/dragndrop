import dynamic from "next/dynamic";

const BoardNoSSR = dynamic(() => import("@/components/KanbanBoard"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="container m-auto mt-14">
      <BoardNoSSR />
    </main>
  );
}
