import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import TextGenerator from "./pages/TextGenerator";
import VoiceDubbing from "./pages/VoiceDubbing";
import ImageGenerator from "./pages/ImageGenerator";
import VideoGenerator from "./pages/VideoGenerator";
import VideoEditor from "./pages/VideoEditor";
import Auth from "./pages/Auth";
import ContentScheduling from "./pages/ContentScheduling";
import CreateSchedule from "./pages/CreateSchedule";
import ScheduleDetail from "./pages/ScheduleDetail";
import NotFound from "./pages/NotFound";
import CommandCenter from "./pages/CommandCenter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/text" element={<ProtectedRoute><TextGenerator /></ProtectedRoute>} />
            <Route path="/voice" element={<ProtectedRoute><VoiceDubbing /></ProtectedRoute>} />
            <Route path="/image" element={<ProtectedRoute><ImageGenerator /></ProtectedRoute>} />
            <Route path="/video" element={<ProtectedRoute><VideoGenerator /></ProtectedRoute>} />
            <Route path="/edit-video" element={<ProtectedRoute><VideoEditor /></ProtectedRoute>} />
            <Route path="/scheduling" element={<ProtectedRoute><ContentScheduling /></ProtectedRoute>} />
            <Route path="/scheduling/create" element={<ProtectedRoute><CreateSchedule /></ProtectedRoute>} />
            <Route path="/scheduling/:id" element={<ProtectedRoute><ScheduleDetail /></ProtectedRoute>} />
            <Route path="/command-center" element={<ProtectedRoute><CommandCenter /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
