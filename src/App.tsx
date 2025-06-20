
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/useAuth";
import { OfflineProvider } from "@/hooks/useOffline";
import { PWAInstall } from "@/components/pwa-install";
import { OfflineStatus } from "@/components/offline-status";
import Index from "./pages/Index";
import Apps from "./pages/Apps";
import AppDetail from "./pages/AppDetail";
import IdeaVault from "./pages/IdeaVault";
import Development from "./pages/Development";
import Marketing from "./pages/Marketing";
import Revenue from "./pages/Revenue";
import Analytics from "./pages/Analytics";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="launchboard-ui-theme">
        <AuthProvider>
          <OfflineProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/apps" element={<Apps />} />
              <Route path="/apps/:id" element={<AppDetail />} />
              <Route path="/ideas" element={<IdeaVault />} />
              <Route path="/development" element={<Development />} />
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/deployment" element={<Development />} />
              <Route path="/revenue" element={<Revenue />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <PWAInstall />
            <OfflineStatus />
            <Toaster />
            <Sonner />
          </OfflineProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
