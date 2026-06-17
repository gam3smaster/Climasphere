import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { OnboardingModal } from './components/onboarding/OnboardingModal'
import Dashboard from './pages/Dashboard'
import Forecast from './pages/Forecast'
import Maps from './pages/Maps'
import Radar from './pages/Radar'
import AirQuality from './pages/AirQuality'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <OnboardingModal />
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/maps" element={<Maps />} />
          <Route path="/radar" element={<Radar />} />
          <Route path="/air" element={<AirQuality />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
