import { useState, useCallback, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import Index from "./pages/Index";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import Project from "./pages/Project";
import Product from "./pages/Product";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import ECourse from "./pages/ECourse";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentPending from "./pages/PaymentPending";
import PaymentError from "./pages/PaymentError";
import Layout from "./components/layout/Layout";
import Auth from "./pages/Auth";
import { AuthProvider } from "./hooks/useAuth";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminArticleEdit from "./pages/admin/AdminArticleEdit";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductEdit from "./pages/admin/AdminProductEdit";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminProjectEdit from "./pages/admin/AdminProjectEdit";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminCourseEdit from "./pages/admin/AdminCourseEdit";
import LearnLanding from "./learn/pages/Landing";
import LearnCourses from "./learn/pages/Courses";
import LearnCourseDetail from "./learn/pages/CourseDetail";
import LearnLesson from "./learn/pages/Lesson";
import LearnDashboard from "./learn/pages/Dashboard";
import LearnCertificate from "./learn/pages/Certificate";
import Library from "./pages/Library";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return sessionStorage.getItem("splashShown") !== "1";
    } catch {
      return true;
    }
  });
  const handleSplashFinish = useCallback(() => {
    try { sessionStorage.setItem("splashShown", "1"); } catch {}
    setShowSplash(false);
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Admin routes — no public layout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="articles" element={<AdminArticles />} />
              <Route path="articles/new" element={<AdminArticleEdit />} />
              <Route path="articles/:id" element={<AdminArticleEdit />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductEdit />} />
              <Route path="products/:id" element={<AdminProductEdit />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="projects/new" element={<AdminProjectEdit />} />
              <Route path="projects/:id" element={<AdminProjectEdit />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="courses/new" element={<AdminCourseEdit />} />
              <Route path="courses/:id" element={<AdminCourseEdit />} />
            </Route>
            {/* Learning platform (learn.satulangkahbooks.com) — separate shell */}
            <Route path="/learn" element={<LearnLanding />} />
            <Route path="/learn/courses" element={<LearnCourses />} />
            <Route path="/learn/course/:slug" element={<LearnCourseDetail />} />
            <Route path="/learn/course/:slug/lesson/:lessonId" element={<LearnLesson />} />
            <Route path="/learn/dashboard" element={<LearnDashboard />} />
            <Route path="/learn/dashboard/:section" element={<LearnDashboard />} />
            <Route path="/learn/certificate/:slug" element={<LearnCertificate />} />
            {/* Public routes */}
            <Route
              path="*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/articles" element={<Articles />} />
                    <Route path="/articles/:id" element={<ArticleDetail />} />
                    <Route path="/project" element={<Project />} />
                    <Route path="/product" element={<Product />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/checkout/:productId" element={<Checkout />} />
                    <Route path="/e-course" element={<ECourse />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/payment/success" element={<PaymentSuccess />} />
                    <Route path="/payment/pending" element={<PaymentPending />} />
                    <Route path="/payment/error" element={<PaymentError />} />
                    <Route path="*" element={<NotFound />} />
                    <Route path="/library" element={<Library/>} />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
