import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth'
import AppShell from './components/AppShell'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import PuzzleGenerator from './pages/PuzzleGenerator'
import ColoringGenerator from './pages/ColoringGenerator'
import CoverCreator from './pages/CoverCreator'
import MetadataGenerator from './pages/MetadataGenerator'
import MarketResearch from './pages/MarketResearch'
import NicheFinder from './pages/NicheFinder'
import KeywordResearch from './pages/KeywordResearch'
import AssetLibrary from './pages/AssetLibrary'
import TemplateLibrary from './pages/TemplateLibrary'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import AdminPanel from './pages/AdminPanel'
import Profile from './pages/Profile'
import AuthPage from './pages/AuthPage'
import NotFound from './pages/NotFound'

function ProtectedRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/puzzle-generator" element={<PuzzleGenerator />} />
        <Route path="/coloring-generator" element={<ColoringGenerator />} />
        <Route path="/cover-creator" element={<CoverCreator />} />
        <Route path="/metadata" element={<MetadataGenerator />} />
        <Route path="/market-research" element={<MarketResearch />} />
        <Route path="/niche-finder" element={<NicheFinder />} />
        <Route path="/keyword-research" element={<KeywordResearch />} />
        <Route path="/assets" element={<AssetLibrary />} />
        <Route path="/templates" element={<TemplateLibrary />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  )
}

function PublicRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return user ? <ProtectedRoutes /> : <PublicRoutes />
}
