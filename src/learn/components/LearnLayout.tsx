import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import LearnTopbar from "./LearnTopbar";
import LearnFooter from "./LearnFooter";

const LearnLayout = ({ children, footer = true }: { children: ReactNode; footer?: boolean }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="learn-scope flex min-h-screen flex-col bg-background">
      <LearnTopbar />
      <main className="flex-1">{children}</main>
      {footer && <LearnFooter />}
    </div>
  );
};

export default LearnLayout;