import { Routes, Route } from 'react-router-dom';
import { TabLayout } from './components/TabLayout';
import { HomePage } from './pages/HomePage';
import { AdventuresPage } from './pages/AdventuresPage';
import { MapPage } from './pages/MapPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdventureDetailPage } from './pages/AdventureDetailPage';

export function App() {
  return (
    <Routes>
      <Route element={<TabLayout />}>
        <Route index element={<HomePage />} />
        <Route path="adventures" element={<AdventuresPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="adventure/:id" element={<AdventureDetailPage />} />
    </Routes>
  );
}
