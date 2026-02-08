import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProjectProvider } from "@/contexts/ProjectContext";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import MilestonesPage from "./pages/Milestones";
import RisksPage from "./pages/Risks";
import StakeholdersPage from "./pages/Stakeholders";
import DecisionsPage from "./pages/Decisions";
import ReportsPage from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ProjectProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/milestones" element={<MilestonesPage />} />
              <Route path="/risks" element={<RisksPage />} />
              <Route path="/stakeholders" element={<StakeholdersPage />} />
              <Route path="/decisions" element={<DecisionsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ProjectProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
