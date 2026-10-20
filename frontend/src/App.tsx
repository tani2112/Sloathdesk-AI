import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer, ToastMessage } from './components/Toast';
import { FolderPickerModal } from './components/FolderPickerModal';
import { SlothMood } from './components/SlothMascot';
import { api } from './services/api';
import {
  HealthResponse,
  ScanResponse,
  CleanupScanResponse,
  HistoryBatchItem,
  SystemSettings,
  OllamaStatusResponse,
} from './types';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { OrganizerPage } from './pages/OrganizerPage';
import { RenamerPage } from './pages/RenamerPage';
import { FindFilesPage } from './pages/FindFilesPage';
import { CleanupPage } from './pages/CleanupPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [activeFolder, setActiveFolder] = useState<string>('');
  const [defaultFolders, setDefaultFolders] = useState<Array<{ label: string; path: string; exists: boolean }>>([]);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  // Data States
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [aiStatus, setAiStatus] = useState<OllamaStatusResponse | null>(null);
  const [scanData, setScanData] = useState<ScanResponse | null>(null);
  const [cleanupData, setCleanupData] = useState<CleanupScanResponse | null>(null);
  const [historyData, setHistoryData] = useState<HistoryBatchItem[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [slothMood, setSlothMood] = useState<SlothMood>('awake');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast helper
  const showToast = useCallback(
    (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Initial Load: Fetch defaults, health, settings
  useEffect(() => {
    async function initApp() {
      setIsLoading(true);
      try {
        const [defaults, health, settings, status] = await Promise.all([
          api.getDefaultFolders(),
          api.getHealth(),
          api.getSettings(),
          api.getAiStatus(),
        ]);

        setDefaultFolders(defaults.default_folders);
        setActiveFolder(defaults.recommended);
        setHealthData(health);
        setSystemSettings(settings);
        setAiStatus(status);
      } catch (err: any) {
        showToast('error', 'Initialization error', err.message);
      } finally {
        setIsLoading(false);
      }
    }
    initApp();
  }, [showToast]);

  // 2. Refresh folder data whenever activeFolder changes
  const refreshFolderData = useCallback(async () => {
    if (!activeFolder) return;
    setIsLoading(true);
    setSlothMood('thinking');
    try {
      const [scan, cleanup, history, health, status] = await Promise.all([
        api.scanFolder(activeFolder, false, false),
        api.scanCleanup(activeFolder),
        api.getHistory(50),
        api.getHealth(),
        api.getAiStatus(),
      ]);

      setScanData(scan);
      setCleanupData(cleanup);
      setHistoryData(history);
      setHealthData(health);
      setAiStatus(status);
      setSlothMood('awake');
    } catch (err: any) {
      showToast('error', 'Failed loading folder', err.message);
      setSlothMood('sleeping');
    } finally {
      setIsLoading(false);
    }
  }, [activeFolder, showToast]);

  useEffect(() => {
    if (activeFolder) {
      refreshFolderData();
    }
  }, [activeFolder, refreshFolderData]);

  // Undo Handler
  const handleUndoBatch = async (batchId: string) => {
    setIsLoading(true);
    try {
      const res = await api.undoBatch(batchId);
      if (res.success) {
        showToast('success', 'Operation Undone', res.message);
        setSlothMood('happy');
        refreshFolderData();
      } else {
        showToast('warning', 'Undo Conflict', res.conflicts.join(', '));
      }
    } catch (err: any) {
      showToast('error', 'Undo failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMood = () => {
    setSlothMood((prev) => (prev === 'tea' ? 'awake' : prev === 'sleeping' ? 'awake' : 'tea'));
  };

  // Tab Titles
  const tabTitles: Record<NavTab, string> = {
    dashboard: 'Dashboard',
    organizer: 'Smart File Organizer',
    renamer: 'AI File Renamer',
    search: 'Find My Files',
    cleanup: 'Lazy Cleanup Assistant',
    history: 'Activity History & Undo',
    settings: 'Settings & AI Engine',
  };

  return (
    <div className="flex h-screen bg-[#0b0f17] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeFolder={activeFolder}
        onOpenFolderModal={() => setIsFolderModalOpen(true)}
        aiStatus={aiStatus}
        slothMood={slothMood}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <Header
          title={tabTitles[currentTab]}
          activeFolder={activeFolder}
          onOpenFolderModal={() => setIsFolderModalOpen(true)}
          onRefresh={refreshFolderData}
          isLoading={isLoading}
          aiStatus={aiStatus}
          slothMood={slothMood}
          onToggleMood={handleToggleMood}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              activeFolder={activeFolder}
              scanData={scanData}
              healthData={healthData}
              cleanupData={cleanupData}
              historyData={historyData}
              isLoading={isLoading}
              onRefresh={refreshFolderData}
              onNavigate={setCurrentTab}
              onUndoBatch={handleUndoBatch}
              slothMood={slothMood}
            />
          )}

          {currentTab === 'organizer' && (
            <OrganizerPage
              activeFolder={activeFolder}
              onRefreshStats={refreshFolderData}
              showToast={showToast}
            />
          )}

          {currentTab === 'renamer' && (
            <RenamerPage
              activeFolder={activeFolder}
              onRefreshStats={refreshFolderData}
              showToast={showToast}
            />
          )}

          {currentTab === 'search' && (
            <FindFilesPage activeFolder={activeFolder} showToast={showToast} />
          )}

          {currentTab === 'cleanup' && (
            <CleanupPage
              activeFolder={activeFolder}
              cleanupData={cleanupData}
              isLoading={isLoading}
              onRefresh={refreshFolderData}
              showToast={showToast}
            />
          )}

          {currentTab === 'history' && (
            <HistoryPage
              historyData={historyData}
              onUndoBatch={handleUndoBatch}
              showToast={showToast}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              settings={systemSettings}
              aiStatus={aiStatus}
              onRefreshStats={refreshFolderData}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Folder Picker Modal */}
      <FolderPickerModal
        isOpen={isFolderModalOpen}
        currentFolder={activeFolder}
        defaultFolders={defaultFolders}
        onSelectFolder={(folder) => setActiveFolder(folder)}
        onClose={() => setIsFolderModalOpen(false)}
      />

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
