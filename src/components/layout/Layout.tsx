import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BottomNavBar from "./BottomNavBar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 md:pt-20 pb-20 lg:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNavBar />
    </div>
  );
};

export default Layout;
