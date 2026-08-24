import WorkerTopBar from "@/components/nav/WorkerTopBar";

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkerTopBar>{children}</WorkerTopBar>;
}