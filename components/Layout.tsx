import dynamic from "next/dynamic";
import { ReactNode } from "react";

const ChatLauncher = dynamic(() => import("./ChatLauncher"), { ssr: false });

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ChatLauncher />
    </>
  );
}
