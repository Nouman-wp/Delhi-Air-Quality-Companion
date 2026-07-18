import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";

export function AppLayout() {
  const location = useLocation();
  // The map is a full-viewport experience — a footer would fight the map canvas.
  const showFooter = location.pathname !== "/map";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col pb-20 md:pb-0">
        <Outlet />
        {showFooter && <Footer />}
      </main>
      <BottomNav />
    </div>
  );
}
