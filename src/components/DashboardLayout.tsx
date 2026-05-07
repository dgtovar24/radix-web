'use client';

import React, { Component, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ThemeProvider from './ThemeProvider';
import ConfigurationPage from './ConfigurationPage';
import RadixLogo from './RadixLogo';
import {
  patients,
  treatments,
  users,
  doctors,
  type User as ApiUser,
} from '../services/api';
import { useWebSocketChat, useWebSocketRix } from '../hooks/useWebSocketChat';
import { ModulesProvider } from '../context/ModulesContext';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bot,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Maximize2,
  MessageCircle,
  Minimize2,
  Mic,
  Paperclip,
  Plus,
  Search,
  Send,
  Settings,
  Shield,
  Smile,
  Sparkles,
  KeyRound,
  Save,
  User,
  UserPlus,
  Users,
} from 'lucide-react';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  userName: string;
  userRole: string;
  userId?: number;
  userEmail?: string;
  initialRightSidebarOpen?: boolean;
  configPage?: 'configuration' | 'patients' | 'treatments' | 'devices' | 'rix' | 'profile' | 'analytics';
}

type RightPanelTab = 'chat' | 'rix';
type CalendarPatient = { id: string; name: string; start: string; end: string; color: string };

class ShellErrorBoundary extends Component<{ children: React.ReactNode; label: string }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error(`Radix UI error (${this.props.label})`, error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{
        padding: 20,
        borderRadius: 18,
        border: '1px solid var(--br, #e5e7eb)',
        background: 'var(--sf, #ffffff)',
        color: 'var(--t, #111827)',
        fontSize: 14,
        fontWeight: 700,
      }}>
        No se pudo cargar esta sección. Actualiza la página o inténtalo de nuevo.
      </div>
    );
  }
}

export default function DashboardLayout({ children, userName, userRole, userId, userEmail, initialRightSidebarOpen = true, configPage }: DashboardLayoutProps) {
  return (
    <ThemeProvider>
      <ModulesProvider>
        <DashboardLayoutInner {...{ children, userName, userRole, userId, userEmail, initialRightSidebarOpen, configPage }} />
      </ModulesProvider>
    </ThemeProvider>
  );
}

function DashboardLayoutInner({ children, userName, userRole, userId, userEmail, initialRightSidebarOpen = true, configPage }: DashboardLayoutProps) {
  const isRixRoute = configPage === 'rix';
  const [activeRightTab, setActiveRightTab] = useState<RightPanelTab>(isRixRoute ? 'rix' : 'chat');
  const [isRixExpanding, setIsRixExpanding] = useState(isRixRoute);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarPatientFilter, setCalendarPatientFilter] = useState('todos');
  const [calendarPatients, setCalendarPatients] = useState<CalendarPatient[]>([
    { id: 'todos', name: 'Todos los pacientes', start: '', end: '', color: 'var(--p, #7c3aed)' },
  ]);
  const resolveActiveNav = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('mi-perfil')) return 'profile';
      if (path.includes('pacientes')) return 'pacientes';
      if (path.includes('tratamientos')) return 'tratamientos';
      if (path.includes('alertas')) return 'alertas';
      if (path.includes('usuarios')) return 'usuarios';
      if (path.includes('configuracion')) return 'settings';
      if (path.includes('rix')) return 'rix';
      if (path.includes('analisis')) return 'analytics';
    }
    if (configPage === 'configuration') return 'settings';
    if (configPage === 'rix') return 'rix';
    if (configPage === 'analytics') return 'analytics';
    if (configPage === 'profile') return 'profile';
    return 'home';
  };

  const [activeNav, setActiveNav] = useState(() => {
    if (configPage === 'configuration') return 'settings';
    if (configPage === 'rix') return 'rix';
    if (configPage === 'analytics') return 'analytics';
    if (configPage === 'profile') return 'profile';
    return 'home';
  });

  useLayoutEffect(() => {
    setActiveNav(resolveActiveNav());
  }, [configPage]);

  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('radix_right_sidebar');
      return stored !== null ? stored === 'true' : initialRightSidebarOpen;
    }
    return initialRightSidebarOpen;
  });

  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('radix_left_sidebar');
      return stored !== null ? stored === 'true' : true;
    }
    return true;
  });
  const [sidebarPrefsReady, setSidebarPrefsReady] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1440);
  const updateRightSidebarOpen = (next: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('radix_right_sidebar', String(next));
      document.cookie = `radix-right-sidebar=${String(next)}; path=/; max-age=31536000; SameSite=Lax`;
    }
    setIsRightSidebarOpen(next);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncSidebarPrefs = () => {
      const storedRight = localStorage.getItem('radix_right_sidebar');
      const storedLeft = localStorage.getItem('radix_left_sidebar');
      setIsRightSidebarOpen(storedRight !== null ? storedRight === 'true' : initialRightSidebarOpen);
      if (storedLeft !== null) setIsLeftSidebarOpen(storedLeft === 'true');
    };
    syncSidebarPrefs();
    const timers = [0, 80, 240, 600].map(delay => window.setTimeout(syncSidebarPrefs, delay));
    setSidebarPrefsReady(true);
    return () => timers.forEach(window.clearTimeout);
  }, [activeNav, configPage, initialRightSidebarOpen]);

  useEffect(() => {
    if (!sidebarPrefsReady) return;
    localStorage.setItem('radix_right_sidebar', String(isRightSidebarOpen));
    document.cookie = `radix-right-sidebar=${String(isRightSidebarOpen)}; path=/; max-age=31536000; SameSite=Lax`;
  }, [isRightSidebarOpen, sidebarPrefsReady]);

  useEffect(() => {
    if (!sidebarPrefsReady) return;
    localStorage.setItem('radix_left_sidebar', String(isLeftSidebarOpen));
  }, [isLeftSidebarOpen, sidebarPrefsReady]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  useEffect(() => {
    if (isRixRoute) {
      setActiveRightTab('rix');
      setIsRixExpanding(true);
      setIsChatExpanded(false);
      if (typeof window !== 'undefined' && localStorage.getItem('radix_right_sidebar') === null) {
        updateRightSidebarOpen(true);
      }
    }
  }, [isRixRoute]);

  useEffect(() => {
    Promise.all([patients.getAll(), treatments.getAll()])
      .then(([patientList, treatmentList]) => {
        const colors = ['#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];
        const ranges = patientList.map((patient, index) => {
          const treatment = treatmentList.find(item => item.patientId === patient.id);
          const start = treatment?.startDate ? treatment.startDate.slice(0, 10) : '';
          const end = treatment?.endDate
            ? treatment.endDate.slice(0, 10)
            : treatment?.startDate
              ? new Date(new Date(treatment.startDate).getTime() + (treatment.isolationDays || 0) * 86400000).toISOString().slice(0, 10)
              : '';
          return { id: String(patient.id), name: patient.fullName, start, end, color: colors[index % colors.length] };
        }).filter(patient => patient.start && patient.end);
        setCalendarPatients([
          { id: 'todos', name: 'Todos los pacientes', start: '', end: '', color: 'var(--p, #7c3aed)' },
          ...ranges,
        ]);
      })
      .catch(() => setCalendarPatients([
        { id: 'todos', name: 'Todos los pacientes', start: '', end: '', color: 'var(--p, #7c3aed)' },
      ]));
  }, []);

  const launchRix = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ left: 0, top: 0 });
    }
    updateRightSidebarOpen(true);
    setActiveRightTab('rix');
    setIsRixExpanding(true);
    setIsChatExpanded(false);

    if (typeof window !== 'undefined' && window.location.pathname !== '/rix') {
      window.setTimeout(() => {
        window.history.pushState(null, '', '/rix');
      }, 860);
    }
  };

  const openInternalChat = () => {
    setActiveRightTab('chat');
    updateRightSidebarOpen(true);
    setIsChatExpanded(true);
    setIsRixExpanding(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ left: 0, top: 0 });
    }
  };

  const toggleInternalChatExpanded = () => {
    setActiveRightTab('chat');
    updateRightSidebarOpen(true);
    setIsRixExpanding(false);
    setIsChatExpanded((current) => {
      const next = !current;
      if (!next && typeof window !== 'undefined' && window.location.pathname === '/rix') {
        window.history.pushState(null, '', '/dashboard');
      }
      return next;
    });
  };

  const openMobileAssistant = () => {
    setActiveRightTab('chat');
    updateRightSidebarOpen(true);
    setIsRixExpanding(false);
    setIsChatExpanded(true);
  };

  const closeMobileAssistant = () => {
    setIsRixExpanding(false);
    setIsChatExpanded(false);
    if (typeof window !== 'undefined' && window.location.pathname === '/rix') {
      window.location.replace('/dashboard');
    }
  };

  const assistantExpanded = isRixExpanding || isChatExpanded;

  const isMobile = viewportWidth <= 760;
  const isCompact = viewportWidth <= 1180;
  const useOverlayPanels = isCompact;
  const leftColumnPx = !useOverlayPanels && isLeftSidebarOpen ? 240 : 0;
  const storedRightSidebarValue = typeof window !== 'undefined' ? localStorage.getItem('radix_right_sidebar') : null;
  const rightSidebarVisible = storedRightSidebarValue !== null ? storedRightSidebarValue === 'true' : isRightSidebarOpen;
  const compactRightPx = !useOverlayPanels && rightSidebarVisible ? Math.min(340, Math.max(300, Math.round(viewportWidth * 0.3))) : 0;
  const gridTemplateColumns = useOverlayPanels
    ? 'minmax(0, 1fr)'
    : assistantExpanded
    ? `${leftColumnPx}px minmax(0, 0px) minmax(0, 1fr)`
    : `${leftColumnPx}px minmax(0, 1fr) ${compactRightPx}px`;

  const headerContent = {
    home: { title: `Hola, ${userName}`, subtitle: 'Sigue el progreso general de la clínica médica aquí.' },
    pacientes: { title: 'Gestión de Pacientes', subtitle: 'Administra y registra los pacientes y sus datos.' },
    tratamientos: { title: 'Tratamientos Activos', subtitle: 'Controla los planes de medicina nuclear en curso.' },
    alertas: { title: 'Centro de Alertas', subtitle: 'Avisos y notificaciones médicas urgentes.' },
    usuarios: { title: 'Usuarios del Sistema', subtitle: 'Administra los roles y accesos a la plataforma.' },
    settings: { title: 'Configuración', subtitle: 'Administración del sistema' },
    rix: { title: 'Rix', subtitle: 'Asistente de IA de Radix.' },
    analytics: { title: 'Análisis', subtitle: 'Explora datos, genera gráficos personalizados y analiza métricas clínicas.' },
    profile: { title: 'Mi perfil', subtitle: 'Gestiona tu identidad y la sesión activa.' },
  };

  const currentHeader = headerContent[activeNav as keyof typeof headerContent] || headerContent.home;

  return (
    <div
      data-radix-shell="true"
      data-right-open={rightSidebarVisible ? 'true' : 'false'}
      data-right-state={isRightSidebarOpen ? 'true' : 'false'}
      style={{
        display: 'grid',
        gridTemplateColumns,
        transition: 'grid-template-columns 0.82s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        background: 'var(--b, #ffffff)',
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden',
      }}
    >
      {!isMobile && (
        <LeftSidebar
          activeNav={activeNav}
          activeRightTab={activeRightTab}
          chatExpanded={isChatExpanded}
          isOpen={useOverlayPanels ? isMobileMenuOpen : isLeftSidebarOpen}
          isMobile={useOverlayPanels}
          userRole={userRole}
          userName={userName}
          onChatClick={() => {
            openInternalChat();
            setIsMobileMenuOpen(false);
          }}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        style={{
          gridColumn: useOverlayPanels ? 1 : 2,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          minWidth: 0,
          overflow: 'hidden',
          borderRight: assistantExpanded ? 'none' : '1px solid var(--br, #f3f4f6)',
          background: 'var(--b, #ffffff)',
          opacity: assistantExpanded ? 0.38 : 1,
          transform: assistantExpanded ? 'translateX(-18px)' : 'translateX(0)',
          transition: 'opacity 0.7s ease, transform 0.82s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: assistantExpanded ? 'none' : 'auto',
        }}
      >
        {!useOverlayPanels && <button
          onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
          style={roundToggleStyle(isLeftSidebarOpen ? -14 : 14, 'left')}
          title={isLeftSidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
        >
          {isLeftSidebarOpen ? <ChevronLeft size={16} strokeWidth={2.5} /> : <ChevronRight size={16} strokeWidth={2.5} />}
        </button>}

        {!useOverlayPanels && <button
          onClick={() => updateRightSidebarOpen(!rightSidebarVisible)}
          style={roundToggleStyle(rightSidebarVisible ? -14 : 14, 'right')}
          title={rightSidebarVisible ? 'Ocultar panel' : 'Mostrar panel'}
        >
          {rightSidebarVisible ? <ChevronRight size={16} strokeWidth={2.5} /> : <ChevronLeft size={16} strokeWidth={2.5} />}
        </button>}

        <main
          data-radix-main-scroll="true"
          style={{
            flex: 1,
            padding: isMobile ? '16px 16px 124px' : (isCompact ? '24px 24px 96px' : '32px 40px'),
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {useOverlayPanels && !isMobile && (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Abrir menú"
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                border: '1px solid var(--br, #e5e7eb)',
                background: 'var(--sf, #ffffff)',
                color: 'var(--t, #111827)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                cursor: 'pointer',
              }}
            >
              <Menu size={20} />
            </button>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 16 : 24,
            marginBottom: isMobile ? 28 : 40,
          }}>
            <div>
              <h1 style={{ fontSize: isMobile ? 30 : 28, lineHeight: 1.08, fontWeight: 700, color: 'var(--t, #111827)', letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>
                {currentHeader.title}
              </h1>
              <p style={{ margin: 0, fontSize: isMobile ? 15 : 14, color: 'var(--t-s, #9ca3af)', fontWeight: 500, lineHeight: 1.45 }}>
                {currentHeader.subtitle}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, alignSelf: isMobile ? 'stretch' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-start' }}>
              <button
                type="button"
                onClick={() => setIsCalendarOpen(true)}
                aria-label="Abrir calendario de pacientes"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: isMobile ? '7px 8px 7px 12px' : '8px 9px 8px 12px',
                  borderRadius: 14,
                  border: '1px solid var(--br, #e5e7eb)',
                  background: 'var(--sf, #ffffff)',
                  color: 'var(--t, #111827)',
                  boxShadow: '0 4px 14px rgba(15,23,42,0.04)',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <span style={{ fontSize: isMobile ? 12 : 13, fontWeight: 700, color: 'var(--t-s, #4b5563)', whiteSpace: 'nowrap' }}>16 May, 2023</span>
                <span style={{
                  width: isMobile ? 32 : 34,
                  height: isMobile ? 32 : 34,
                  borderRadius: 10,
                  background: 'var(--b, #f3f4f6)',
                  border: '1px solid var(--br, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--t, #111827)',
                }}>
                <Calendar size={16} strokeWidth={2} />
                </span>
              </button>
            </div>
          </div>

          <ShellErrorBoundary label="main">
            {configPage === 'configuration' ? <ConfigurationPage /> : configPage === 'profile' ? <ProfilePage userName={userName} userRole={userRole} userId={userId} userEmail={userEmail} /> : children}
          </ShellErrorBoundary>
        </main>
      </div>

      <ShellErrorBoundary label="assistant">
      <RightAssistantColumn
        expanded={assistantExpanded}
        open={rightSidebarVisible}
        isMobile={useOverlayPanels}
        activeTab={activeRightTab}
        chatExpanded={isChatExpanded}
        onChatClick={openInternalChat}
        onRixClick={launchRix}
        onToggleChatExpanded={toggleInternalChatExpanded}
        onOpenFloating={openMobileAssistant}
        onCloseMobile={closeMobileAssistant}
        hasMobileFooter={isMobile}
      />
      </ShellErrorBoundary>

      {isMobile && !assistantExpanded && (
        <MobileFooterBar activeNav={activeNav} activeRightTab={activeRightTab} />
      )}

      <PatientCalendarModal
        open={isCalendarOpen}
        patients={calendarPatients}
        selectedPatient={calendarPatientFilter}
        onSelectedPatientChange={setCalendarPatientFilter}
        onClose={() => setIsCalendarOpen(false)}
        isMobile={isMobile}
      />
    </div>
  );
}

function LeftSidebar({
  activeNav,
  activeRightTab,
  chatExpanded,
  isOpen,
  isMobile,
  onChatClick,
  onCloseMobile,
  userRole,
  userName,
}: {
  activeNav: string;
  activeRightTab: RightPanelTab;
  chatExpanded: boolean;
  isOpen: boolean;
  isMobile: boolean;
  onChatClick: () => void;
  onCloseMobile: () => void;
  userRole: string;
  userName: string;
}) {
  const isAdminRole = userRole === 'ADMIN' || userRole === 'Admin';
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const navItems = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', description: 'Resumen operativo: pacientes, tratamientos, alertas y radiación.' },
    { id: 'tratamientos', label: 'Tratamientos', icon: Activity, href: '/tratamientos', description: 'Planes activos, dosis, confinamiento y estado clínico.' },
    { id: 'pacientes', label: 'Pacientes', icon: Users, href: '/pacientes', description: 'Expedientes, contacto, asignaciones y seguimiento de pacientes.' },
    { id: 'alertas', label: 'Alertas', icon: Bell, href: '/alertas', description: 'Avisos urgentes con acceso rápido a paciente, llamada y mensaje.' },
    { id: 'usuarios', label: 'Usuarios', icon: Shield, href: '/usuarios', description: 'Roles, facultativos, administradores y permisos del sistema.' },
    { id: 'chat', label: 'Chat interno', icon: MessageCircle, onClick: onChatClick, description: 'Conversaciones internas entre usuarios y grupos clínicos.' },
    { id: 'rix', label: 'Rix', icon: Bot, href: '/rix', description: 'Asistente IA para consultar contexto clínico y sesiones grupales.' },
    { id: 'analytics', label: 'Análisis', icon: BarChart3, href: '/analisis', description: 'Analíticas de datos, gráficos personalizados y exploración de métricas.' },
    ...(isAdminRole ? [{ id: 'settings', label: 'Configuración', icon: Settings, href: '/configuracion', description: 'SMTP, IA, API keys, seguridad e integraciones.' }] : []),
  ];

  const sidebar = (
    <aside
      style={{
        background: 'var(--sf, #ffffff)',
        borderRight: '1px solid var(--br, #f3f4f6)',
        display: 'flex',
        gridColumn: 1,
        flexDirection: 'column',
        height: '100dvh',
        position: isMobile ? 'fixed' : 'relative',
        top: isMobile ? 0 : undefined,
        bottom: isMobile ? 0 : undefined,
        left: isMobile ? 0 : undefined,
        width: isMobile ? 'min(82vw, 280px)' : undefined,
        zIndex: isMobile ? 70 : undefined,
        overflow: 'hidden',
        opacity: isMobile || isOpen ? 1 : 0,
        transform: isMobile ? `translateX(${isOpen ? '0' : '-104%'})` : 'translateX(0)',
        boxShadow: isMobile && isOpen ? '18px 0 50px rgba(15, 23, 42, 0.16)' : 'none',
        transition: isMobile
          ? 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.42s ease'
          : 'opacity 0.2s',
      }}
    >
      <div style={{ width: isMobile ? '100%' : 240, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: isMobile ? '24px 20px 18px' : '32px 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <RadixLogo />
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--t, #111827)', letterSpacing: '-0.03em' }}>Radix</div>
            </div>
            {isMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Cerrar menú"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  border: '1px solid var(--br, #e5e7eb)',
                  background: 'var(--b, #f8fafc)',
                  color: 'var(--t, #111827)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0 16px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = item.id === 'chat'
              ? activeRightTab === 'chat' && chatExpanded
              : item.id === 'rix'
                ? activeRightTab === 'rix'
                : activeNav === item.id;
            const commonStyle: React.CSSProperties = {
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: '12px 16px',
              fontSize: 14,
              fontWeight: active ? 700 : 500,
              color: active ? 'var(--t, #111827)' : 'var(--t-s, #6b7280)',
              borderRadius: 12,
              marginBottom: 4,
              textDecoration: 'none',
              position: 'relative',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              textAlign: 'left',
            };
            const content = (
              <>
                {active && <div style={{ position: 'absolute', left: 0, top: 10, bottom: 10, width: 3, background: 'var(--t, #111827)', borderRadius: '0 4px 4px 0' }} />}
                <Icon size={18} strokeWidth={active ? 2.5 : 2} style={{ marginLeft: active ? 4 : 0 }} />
                <span>{item.label}</span>
              </>
            );

            const tooltip = hoveredNav === item.id && !isMobile && (
              <span style={{
                position: 'absolute',
                left: 'calc(100% + 12px)',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 180,
                width: 220,
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid var(--br, #e5e7eb)',
                background: 'var(--t, #111827)',
                color: 'var(--sf, #ffffff)',
                boxShadow: '0 16px 36px rgba(15,23,42,0.18)',
                fontSize: 11,
                fontWeight: 700,
                lineHeight: 1.35,
                pointerEvents: 'none',
              }}>
                {item.description}
              </span>
            );

            return 'onClick' in item ? (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                onMouseEnter={() => setHoveredNav(item.id)}
                onMouseLeave={() => setHoveredNav(null)}
                title={item.description}
                style={commonStyle}
              >
                {content}
                {tooltip}
              </button>
            ) : (
              <a
                key={item.id}
                href={item.href}
                onMouseEnter={() => setHoveredNav(item.id)}
                onMouseLeave={() => setHoveredNav(null)}
                title={item.description}
                style={commonStyle}
              >
                {content}
                {tooltip}
              </a>
            );
          })}
        </nav>

        <div style={{ padding: '0 16px 12px', display: 'grid', gap: 8 }}>
          <div style={{
            padding: 12,
            borderRadius: 16,
            background: 'var(--b, #f8fafc)',
            border: '1px solid var(--br, #e5e7eb)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'var(--p, #7c3aed)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 13,
              }}>
                {(userName || 'U').charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--t, #111827)' }}>{userName || 'Usuario'}</div>
                <div style={{ fontSize: 11, color: 'var(--t-s, #6b7280)' }}>Sesión activa</div>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              <a href="/mi-perfil" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                borderRadius: 10,
                background: activeNav === 'profile' ? 'color-mix(in srgb, var(--p, #7c3aed) 10%, #ffffff)' : 'transparent',
                color: activeNav === 'profile' ? 'var(--p, #7c3aed)' : 'var(--t, #111827)',
                textDecoration: 'none',
                fontSize: 12,
                fontWeight: 800,
              }}>
                <Shield size={15} />
                Mi perfil
              </a>
              <a href="/login" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                borderRadius: 10,
                color: 'var(--t-s, #6b7280)',
                textDecoration: 'none',
                fontSize: 12,
                fontWeight: 800,
              }}>
                <Users size={15} />
                Cambiar usuario
              </a>
            </div>
          </div>
          <a href="/login" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 16px',
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--t-s, #6b7280)',
            textDecoration: 'none',
          }}>
            <LogOut size={18} strokeWidth={2} />
            <span>Salir</span>
          </a>
        </div>
      </div>
    </aside>
  );

  if (!isMobile) return sidebar;
  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar navegación"
        onClick={onCloseMobile}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          border: 'none',
          background: 'rgba(15, 23, 42, 0.28)',
          cursor: 'pointer',
        }}
      />
      {sidebar}
    </>
  );
}

function MobileFooterBar({ activeNav, activeRightTab }: { activeNav: string; activeRightTab: RightPanelTab }) {
  const navItems = [
    { id: 'home', label: 'Inicio', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'tratamientos', label: 'Tratamientos', icon: Activity, href: '/tratamientos' },
    { id: 'pacientes', label: 'Pacientes', icon: Users, href: '/pacientes' },
    { id: 'alertas', label: 'Alertas', icon: Bell, href: '/alertas' },
    { id: 'usuarios', label: 'Usuarios', icon: Shield, href: '/usuarios' },
    { id: 'rix', label: 'Rix', icon: Bot, href: '/rix' },
    { id: 'profile', label: 'Perfil', icon: User, href: '/mi-perfil' },
    { id: 'settings', label: 'Config', icon: Settings, href: '/configuracion' },
  ];

  return (
    <nav
      aria-label="Navegación inferior"
      style={{
        position: 'fixed',
        left: 10,
        right: 10,
        bottom: 10,
        zIndex: 55,
        display: 'flex',
        gap: 6,
        padding: '8px 8px calc(8px + env(safe-area-inset-bottom))',
        borderRadius: 22,
        border: '1px solid var(--br, #e5e7eb)',
        background: 'color-mix(in srgb, var(--sf, #ffffff) 94%, transparent)',
        boxShadow: '0 18px 46px rgba(15,23,42,0.16)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollbarWidth: 'none',
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.id === 'rix' ? activeRightTab === 'rix' : activeNav === item.id;
        return (
          <a
            key={item.id}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            style={{
              flex: '0 0 68px',
              minWidth: 68,
              minHeight: 54,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              borderRadius: 16,
              textDecoration: 'none',
              color: active ? 'var(--p, #7c3aed)' : 'var(--t-s, #6b7280)',
              background: active ? 'color-mix(in srgb, var(--p, #7c3aed) 12%, #ffffff)' : 'transparent',
              border: active ? '1px solid color-mix(in srgb, var(--p, #7c3aed) 20%, transparent)' : '1px solid transparent',
              fontFamily: "'Inter', sans-serif",
              transition: 'background 0.2s ease, color 0.2s ease, transform 0.2s ease',
            }}
          >
            <Icon size={19} strokeWidth={active ? 2.6 : 2.1} />
            <span style={{
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: 10,
              fontWeight: active ? 900 : 750,
              lineHeight: 1.1,
            }}>
              {item.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}

function RightAssistantColumn({
  expanded,
  open,
  isMobile,
  activeTab,
  chatExpanded,
  onChatClick,
  onRixClick,
  onToggleChatExpanded,
  onOpenFloating,
  onCloseMobile,
  hasMobileFooter,
}: {
  expanded: boolean;
  open: boolean;
  isMobile: boolean;
  activeTab: RightPanelTab;
  chatExpanded: boolean;
  onChatClick: () => void;
  onRixClick: () => void;
  onToggleChatExpanded: () => void;
  onOpenFloating: () => void;
  onCloseMobile: () => void;
  hasMobileFooter: boolean;
}) {
  if (isMobile && !expanded) {
    return (
      <button
        type="button"
        aria-label="Abrir chat"
        onClick={onOpenFloating}
        style={{
          position: 'fixed',
          right: 18,
          bottom: hasMobileFooter ? 96 : 18,
          width: 58,
          height: 58,
          borderRadius: '50%',
          border: '1px solid color-mix(in srgb, var(--p, #7c3aed) 30%, transparent)',
          background: 'var(--p, #7c3aed)',
          color: '#ffffff',
          zIndex: 45,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 18px 40px color-mix(in srgb, var(--p, #7c3aed) 34%, transparent)',
          cursor: 'pointer',
          transition: 'transform 0.28s ease, box-shadow 0.28s ease',
        }}
      >
        <MessageCircle size={24} strokeWidth={2.4} />
      </button>
    );
  }

  return (
    <aside
      style={{
        display: 'flex',
        gridColumn: isMobile ? 1 : 3,
        flexDirection: 'column',
        height: '100dvh',
        position: isMobile ? 'fixed' : 'relative',
        inset: isMobile ? 0 : undefined,
        width: isMobile ? '100vw' : undefined,
        zIndex: isMobile ? 80 : undefined,
        overflow: 'hidden',
        background: 'var(--sf, #ffffff)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        borderLeft: expanded ? '1px solid var(--br, #f3f4f6)' : 'none',
        boxShadow: expanded ? '-24px 0 70px rgba(15,23,42,0.08)' : 'none',
        transformOrigin: 'right center',
        transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s ease',
      }}
    >
      <div style={{
        width: expanded ? '100%' : 340,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'width 0.78s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <RightPanelTabs
          activeTab={activeTab}
          chatExpanded={chatExpanded}
          onChatClick={onChatClick}
          onRixClick={onRixClick}
          onToggleChatExpanded={onToggleChatExpanded}
          onCloseMobile={onCloseMobile}
          expanded={expanded}
          isMobile={isMobile}
        />
        {activeTab === 'rix' ? <RixPanel expanded={expanded} isMobile={isMobile} /> : <InternalChatPanel expanded={expanded} isMobile={isMobile} />}
      </div>
    </aside>
  );
}

function RightPanelTabs({
  activeTab,
  chatExpanded,
  onChatClick,
  onRixClick,
  onToggleChatExpanded,
  onCloseMobile,
  expanded,
  isMobile,
}: {
  activeTab: RightPanelTab;
  chatExpanded: boolean;
  onChatClick: () => void;
  onRixClick: () => void;
  onToggleChatExpanded: () => void;
  onCloseMobile: () => void;
  expanded: boolean;
  isMobile: boolean;
}) {
  const tabs = useMemo(() => [
    { id: 'chat' as const, label: 'Chat interno', icon: MessageCircle, onClick: onChatClick },
    { id: 'rix' as const, label: 'Rix', icon: Bot, onClick: onRixClick },
  ], [onChatClick, onRixClick]);

  return (
    <div style={{ padding: expanded ? (isMobile ? '16px 16px 0' : '24px 32px 0') : '20px 20px 0' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile && expanded ? '38px 1fr' : (activeTab === 'chat' ? '1fr 38px' : '1fr'),
          gap: 8,
        }}
      >
        {isMobile && expanded && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Cerrar chat"
            style={{
              width: 38,
              height: 38,
              alignSelf: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              border: '1px solid var(--br, #e5e7eb)',
              background: 'var(--sf, #ffffff)',
              color: 'var(--t, #111827)',
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}
          >
            <X size={16} />
          </button>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 4,
            padding: 4,
            borderRadius: 14,
            background: 'var(--b, #f8fafc)',
            border: '1px solid var(--br, #e5e7eb)',
          }}
        >
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={tab.onClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px 8px',
                  border: 'none',
                  borderRadius: 10,
                  background: active ? 'var(--sf, #ffffff)' : 'transparent',
                  color: active ? 'var(--t, #111827)' : 'var(--t-s, #6b7280)',
                  boxShadow: active ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease',
                }}
              >
                <Icon size={15} strokeWidth={2.3} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'chat' && !isMobile && (
          <button
            type="button"
            onClick={onToggleChatExpanded}
            title={chatExpanded ? 'Reducir chat interno' : 'Agrandar chat interno'}
            style={{
              width: 38,
              height: 38,
              alignSelf: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              border: '1px solid var(--br, #e5e7eb)',
              background: 'var(--sf, #ffffff)',
              color: 'var(--t, #111827)',
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}
          >
            {chatExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}

function InternalChatPanel({ expanded, isMobile }: { expanded: boolean; isMobile: boolean }) {
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<'usuarios' | 'chats' | 'grupos'>('usuarios');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | number>('');
  const [draft, setDraft] = useState('');
  const [msgs, setMsgs] = useState<any[]>([]);
  const { connected, messages: wsMsgs, sendMessage } = useWebSocketChat();

  useEffect(() => {
    let active = true;
    fetch('/api/users').then(r => r.json()).then(data => {
      if (!active || !Array.isArray(data)) return;
      const dir = data.map((u: any) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`.trim() || u.email,
        role: u.role,
      }));
      setUsers(dir);
      setSelected((c: any) => c || dir[0]?.id || '');
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setMsgs((prev: any) => [...prev, ...wsMsgs].slice(-50));
  }, [wsMsgs]);

  const allMsgs = msgs;
  const filtered = users.filter((u: any) =>
    `${u.name} ${u.role || ''}`.toLowerCase().includes(query.toLowerCase())
  );

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const sent = sendMessage(text, 'Tú');
    if (sent) {
      setMsgs((prev: any) => [...prev, { id: Date.now(), senderName: 'Tú', messageText: text, sentAt: new Date().toISOString(), online: true }]);
    }
    setDraft('');
  };

  const wsDot = { width: 6, height: 6, borderRadius: '50%', background: connected ? '#10b981' : '#ef4444' };
  const tabItems = [
    { id: 'usuarios' as const, label: 'Usuarios', short: 'Usu.', icon: Users },
    { id: 'chats' as const, label: 'Chats', short: 'Chat', icon: MessageCircle },
    { id: 'grupos' as const, label: 'Grupos', short: 'Grupo', icon: UserPlus },
  ];
  const useSideRail = expanded && !isMobile;
  const renderTabButton = (item: typeof tabItems[number], compact = false) => {
    const active = tab === item.id;
    const Icon = item.icon;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => setTab(item.id)}
        style={{
          width: compact ? 46 : '100%',
          minHeight: compact ? 46 : 38,
          display: 'flex',
          flexDirection: compact ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: compact ? 'center' : 'flex-start',
          gap: compact ? 2 : 8,
          padding: compact ? 4 : '8px 10px',
          border: active ? '1px solid color-mix(in srgb, var(--p, #7c3aed) 24%, transparent)' : '1px solid transparent',
          borderRadius: 12,
          background: active ? 'color-mix(in srgb, var(--p, #7c3aed) 11%, #ffffff)' : 'transparent',
          color: active ? 'var(--p, #7c3aed)' : 'var(--t-s, #6b7280)',
          fontSize: compact ? 9 : 11,
          fontWeight: 900,
          cursor: 'pointer',
          fontFamily: "'Inter', sans-serif",
          transition: 'background 0.18s ease, border-color 0.18s ease, color 0.18s ease',
        }}
      >
        <Icon size={compact ? 16 : 15} strokeWidth={2.2} />
        <span>{compact ? item.short : item.label}</span>
      </button>
    );
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: useSideRail ? 'row' : 'column',
      height: '100%',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
      padding: useSideRail ? '12px 12px 0' : '12px 14px 0',
      gap: useSideRail ? 10 : 8,
    }}>
      {useSideRail ? (
        <div
          data-chat-side-rail="true"
          style={{
            width: 64,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: 6,
            padding: 8,
            border: '1px solid var(--br, #e5e7eb)',
            borderRadius: 18,
            background: 'color-mix(in srgb, var(--b, #f8fafc) 72%, var(--sf, #ffffff))',
            boxShadow: '0 12px 28px rgba(15,23,42,0.05)',
            flexShrink: 0,
          }}
        >
          {tabItems.map((item) => renderTabButton(item, true))}
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', paddingBottom: 4 }} title={connected ? 'Conectado' : 'Desconectado'}>
            <div style={wsDot} />
          </div>
        </div>
      ) : (
        <div
          data-chat-top-tabs="true"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 5,
            padding: 5,
            border: '1px solid var(--br, #e5e7eb)',
            borderRadius: 16,
            background: 'var(--b, #f8fafc)',
            boxShadow: '0 8px 20px rgba(15,23,42,0.04)',
          }}
        >
          {tabItems.map((item) => renderTabButton(item))}
        </div>
      )}

      {/* RIGHT CONTENT */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflow: 'hidden',
        border: useSideRail ? '1px solid var(--br, #e5e7eb)' : 'none',
        borderRadius: useSideRail ? 18 : 0,
        background: 'var(--sf, #ffffff)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', borderBottom: '1px solid var(--br, #e5e7eb)',
          background: 'var(--sf, #ffffff)',
        }}>
          <Search size={14} color="var(--t-s, #6b7280)" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar..."
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent',
              color: 'var(--t, #111827)', fontSize: 12 }} />
        </div>

        {/* USER LIST / CHATS LIST */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {tab === 'usuarios' && filtered.slice(0, 12).map((u: any) => {
            const sel = u.id === selected;
            return (
              <button key={u.id} type="button" onClick={() => { setSelected(u.id); setTab('chats'); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: 8,
                  borderRadius: 10, border: sel ? '1px solid var(--p)' : '1px solid transparent',
                  background: sel ? 'color-mix(in srgb, var(--p) 8%, #fff)' : 'transparent',
                  cursor: 'pointer', textAlign: 'left',
                }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--p)', color: '#fff', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>{u.name.charAt(0)}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t)' }}>{u.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--t-s)' }}>{u.role}</div>
                </div>
              </button>
            );
          })}
          {tab !== 'usuarios' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--t-s)', fontSize: 12 }}>
              Selecciona un usuario para chatear
            </div>
          )}
        </div>

        {/* MESSAGE AREA */}
        <div style={{ borderTop: '1px solid var(--br)', background: 'var(--sf)' }}>
          <div style={{ maxHeight: 180, overflowY: 'auto', padding: '8px 12px' }}>
            {allMsgs.slice(-15).map((m: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: m.senderName === 'Tú' ? 'var(--p)' : 'var(--t)',
                  color: '#fff', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0,
                }}>{m.senderName.charAt(0)}</div>
                <div style={{
                  background: m.senderName === 'Tú' ? 'var(--p)' : 'var(--b)',
                  color: m.senderName === 'Tú' ? '#fff' : 'var(--t)',
                  padding: '8px 12px', borderRadius: m.senderName === 'Tú' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  fontSize: 12, lineHeight: 1.4, maxWidth: '80%',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 2, opacity: 0.7 }}>{m.senderName}</div>
                  {m.messageText}
                </div>
              </div>
            ))}
          </div>

          {/* INPUT */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '8px 12px', borderTop: '1px solid var(--br)',
          }}>
            <button type="button" style={pBtnStyle} title="Emoji"><Smile size={16} /></button>
            <button type="button" style={pBtnStyle} title="Adjuntar"><Paperclip size={16} /></button>
            <button type="button" style={pBtnStyle} title="Nota de voz"><Mic size={16} /></button>
            <input
              value={draft} onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send(); } }}
              placeholder="Escribe un mensaje..."
              style={{
                flex: 1, border: '1px solid var(--br)', borderRadius: 20,
                padding: '8px 14px', fontSize: 12, outline: 'none',
                background: 'var(--b)', color: 'var(--t)',
              }}
            />
            <button type="button" onClick={send} disabled={!draft.trim()}
              style={{
                width: 36, height: 36, borderRadius: '50%', border: 'none',
                background: draft.trim() ? 'var(--p)' : 'var(--br)',
                color: draft.trim() ? '#fff' : 'var(--t-s)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: draft.trim() ? 'pointer' : 'default',
              }}>
              <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const pBtnStyle: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 8, border: '1px solid var(--br)',
  background: 'var(--sf)', color: 'var(--t-s)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
};

function EmptyInline({ text }: { text: string }) {
  return (
    <div style={{
      padding: '10px 12px',
      borderRadius: 12,
      border: '1px dashed var(--br, #e5e7eb)',
      background: 'color-mix(in srgb, var(--b, #f8fafc) 72%, var(--sf, #ffffff))',
      color: 'var(--t-s, #6b7280)',
      fontSize: 12,
      fontWeight: 700,
      lineHeight: 1.45,
    }}>
      {text}
    </div>
  );
}

function renderMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h4 style="margin:8px 0 4px;font-size:14px;font-weight:700;color:var(--t)">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 style="margin:10px 0 6px;font-size:15px;font-weight:700;color:var(--t)">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 style="margin:12px 0 6px;font-size:16px;font-weight:800;color:var(--t)">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:700;color:var(--t)">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n- (.+)/g, '\n<span style="display:flex;gap:6px">• $1</span>')
    .replace(/\n/g, '<br/>');
}

function ThinkingBubble({ text }: { text: string }) {
  const [open, setOpen] = useState(true);
  if (!text) return null;
  return (
    <div style={{ maxWidth: '85%', marginBottom: 4 }}>
      <button type="button" onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 8, border: 'none',
        background: 'rgba(109,50,232,0.06)', color: 'var(--t-s, #6b7280)',
        fontSize: 11, cursor: 'pointer', opacity: 0.6,
        fontFamily: "'Inter', sans-serif",
      }}>
        <Sparkles size={12} />
        {open ? 'Ocultar razonamiento' : 'Ver razonamiento'}
        <span style={{ fontSize: 9, marginLeft: 2 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{
          marginTop: 4, padding: '8px 12px',
          borderRadius: 10, background: 'rgba(109,50,232,0.04)',
          border: '1px solid rgba(109,50,232,0.1)',
          fontSize: 11, lineHeight: 1.5, color: 'var(--t-s, #6b7280)',
          opacity: 0.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          maxHeight: 160, overflowY: 'auto',
        }}>{text}</div>
      )}
    </div>
  );
}

function RixPanel({ expanded, isMobile }: { expanded: boolean; isMobile: boolean }) {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [activeRixChat, setActiveRixChat] = useState<string | number>('');
  const [showGroupComposer, setShowGroupComposer] = useState(false);
  const [isRixConversationOpen, setIsRixConversationOpen] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(true);
  const [showGroupsPanel, setShowGroupsPanel] = useState(true);
  const [selectedDoctors, setSelectedDoctors] = useState<Array<string | number>>([]);
  const [rixPrompt, setRixPrompt] = useState('');
  const [rixSubmitStatus, setRixSubmitStatus] = useState('');
  const [rixMsgs, setRixMsgs] = useState<Array<{role: string; text: string; thinking?: string; time: string}>>([]);
  const [proMode, setProMode] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [convHistory, setConvHistory] = useState<Array<any>>([]);
  const [attachments, setAttachments] = useState<Array<{name: string; url: string; type: string; text?: string}>>([]);
  const { sendQuery, responses: wsResponses, connected: rixConnected } = useWebSocketRix();
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const msgsRef = useRef<HTMLDivElement>(null);

  // Parse thinking — now comes from separate reasoning events in streaming
  const parseResponse = (text: string) => {
    return { thinking: '', response: text };
  };

  // Conversation history from localStorage
  const [savedChats, setSavedChats] = useState<Array<{id: string; title: string; meta: string; excerpt: string; model: string; msgs: Array<{role:string;text:string;thinking?:string;time:string}>}>>([]);

  // Load saved chats on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('rix-chats');
      if (raw) setSavedChats(JSON.parse(raw));
    } catch {}
  }, []);

  const chats = savedChats;

  const selectedDoctorSummary = selectedDoctors.length
    ? doctors.filter((d) => selectedDoctors.includes(d.id)).map((d) => d.name).join(', ')
    : 'Sin invitados seleccionados';

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(apiUsers => {
      if (!Array.isArray(apiUsers)) return;
      const list = apiUsers
        .filter((u: any) => ['admin', 'facultativo', 'doctor', 'Doctor'].includes(u.role))
        .map((u: any) => ({ id: u.id, name: `${u.firstName} ${u.lastName}`.trim() || u.email, specialty: u.specialty || u.role }));
      setDoctors(list);
      setActiveRixChat((c: any) => c || list[0]?.id || '');
    }).catch(() => {});
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = 'auto';
      taRef.current.style.height = taRef.current.scrollHeight + 'px';
    }
  }, [rixPrompt]);

  // Scroll messages to bottom
  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [rixMsgs]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);

    // Read text content for supported types
    let textContent = '';
    const textTypes = ['text/', 'application/json', 'application/xml', '.md', '.csv', '.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.yml', '.yaml', '.toml'];
    const isText = textTypes.some(t => file.type.startsWith(t) || file.name.endsWith(t));
    if (isText) {
      try {
        textContent = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsText(file);
        });
      } catch {}
    }

    try {
      const res = await fetch('https://api.raddix.pro/v1/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      setAttachments(prev => [...prev, {
        name: data.originalName || file.name,
        url: `https://api.raddix.pro/v1${data.url}`,
        type: file.type,
        text: textContent.slice(0, 8000), // Limit text to avoid token overflow
      }]);
    } catch {}
  };

  const sendRixMessage = () => {
    const text = rixPrompt.trim();
    if (!text && attachments.length === 0) return;

    // Save previous conversation before starting new one
    if (rixMsgs.length > 0 && proMode) {
      const prevMsgs = rixMsgs;
      const firstUserMsg = prevMsgs.find(m => m.role === 'user')?.text?.slice(0, 50) || 'Conversación';
      const lastAIMsg = prevMsgs.filter(m => m.role === 'assistant').pop()?.text?.slice(0, 80) || '';
      const chat = {
        id: Date.now().toString(),
        title: firstUserMsg,
        meta: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        excerpt: lastAIMsg,
        model: proMode ? 'deepseek-v4-pro' : 'deepseek-v4-flash',
        msgs: prevMsgs,
      };
      const updated = [chat, ...savedChats.filter(c => c.title !== firstUserMsg)].slice(0, 20);
      setSavedChats(updated);
      try { localStorage.setItem('rix-chats', JSON.stringify(updated)); } catch {}
      setActiveRixChat(chat.id);
    }
    setIsRixConversationOpen(true);
    setShowHistoryPanel(false);
    setShowGroupsPanel(false);

    let fullText = text || 'Analiza este archivo adjunto';
    if (attachments.length > 0) {
      const fileInfo = attachments.map(a => {
        let info = `\n### Archivo: ${a.name} (${a.type || 'desconocido'})`;
        if (a.text) {
          info += `\n\`\`\`\n${a.text}\n\`\`\``;
        }
        return info;
      }).join('\n');
      fullText = fullText + '\n' + fileInfo;
    }

    setRixMsgs(prev => [...prev, { role: 'user', text: fullText, time: new Date().toISOString() }]);
    setRixPrompt('');
    setAttachments([]);
    setRixSubmitStatus('');
    setThinking(true);

    const model = proMode ? 'deepseek-v4-pro' : 'deepseek-v4-flash';

    // Try WebSocket first
    const sent = sendQuery(text);
    if (!sent) {
      const API_URL = 'https://api.raddix.pro/v1';

      // Build messages array for conversation history (Pro mode)
      const sysMsg = selectedDoctors.length > 0
        ? `Eres Rix-Pro. Contexto clínico — médicos presentes: ${selectedDoctorSummary}. Responde en español concisamente, basado en evidencia. Formatea con Markdown.`
        : 'Eres Rix. Responde en español concisamente, basado en evidencia. Formatea con Markdown cuando sea útil.';

      const messages = proMode
        ? [
            { role: 'system', content: sysMsg },
            ...convHistory,
            { role: 'user', content: fullText }
          ]
        : undefined;

      // Update conversation history for next turn
      if (proMode) {
        setConvHistory(prev => [...prev, { role: 'user', content: fullText }]);
      }

      fetch(`${API_URL}/api/config/ai/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: fullText, model, messages, thinking: true }),
      }).then(async (res) => {
        const reader = res.body?.getReader();
        if (!reader) { setThinking(false); return; }
        const decoder = new TextDecoder();
        let fullResp = '';
        let fullReasoning = '';
        setRixMsgs(prev => [...prev, { role: 'assistant', text: '', time: new Date().toISOString() }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const json = JSON.parse(data);
                if (json.error) { fullResp = json.error; break; }
                if (json.reasoning) {
                  fullReasoning += json.reasoning;
                  setRixMsgs(prev => {
                    const copy = [...prev];
                    const last = copy[copy.length - 1];
                    if (last?.role === 'assistant') {
                      copy[copy.length - 1] = { ...last, thinking: fullReasoning };
                    }
                    return copy;
                  });
                }
                if (json.content) {
                  fullResp += json.content;
                  setRixMsgs(prev => {
                    const copy = [...prev];
                    const last = copy[copy.length - 1];
                    if (last?.role === 'assistant') {
                      copy[copy.length - 1] = { ...last, text: fullResp };
                    }
                    return copy;
                  });
                }
              } catch {}
            }
          }
        }
        setThinking(false);
        if (proMode && fullResp) {
          setConvHistory(prev => [...prev, { role: 'assistant', content: fullResp }]);
        }
      }).catch(() => {
        setRixSubmitStatus('No se pudo contactar con Rix. Intenta de nuevo.');
        setThinking(false);
      });
    } else {
      // WebSocket sent — wait for response to come back via wsResponses
      // If no response after 15s, stop thinking indicator
      setTimeout(() => setThinking(false), 15000);
    }
  };

  // When WebSocket responses arrive, parse them and stop thinking
  useEffect(() => {
    if (wsResponses.length > 0) {
      const last = wsResponses[wsResponses.length - 1];
      const raw = last.text || '';
      if (raw && raw.length > 3) {
        const { thinking: th, response } = parseResponse(raw);
        setRixMsgs(prev => {
          // Avoid duplicates
          const exists = prev.some(m => m.role === 'assistant' && m.text === response);
          if (exists) return prev;
          return [...prev, { role: 'assistant', text: response, thinking: th || undefined, time: last.timestamp || new Date().toISOString() }];
        });
        setThinking(false);
      }
    }
  }, [wsResponses.length]);

  const toggleDoctor = (id: string | number) => {
    setSelectedDoctors(c => c.includes(id) ? c.filter(i => i !== id) : [...c, id]);
  };

  const activeChat = chats.find(c => c.id === activeRixChat) || chats[0];

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: expanded ? (isMobile ? '18px 14px 24px' : '26px clamp(20px, 3vw, 38px) 34px') : '24px 20px',
        background: expanded
          ? 'radial-gradient(circle at 18% 8%, color-mix(in srgb, var(--p, #3b82f6) 14%, transparent), transparent 30%), radial-gradient(circle at 84% 6%, rgba(16,185,129,0.11), transparent 26%), var(--sf, #ffffff)'
          : 'var(--sf, #ffffff)',
        transition: 'padding 0.42s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.42s ease',
      }}
    >
      <div
        style={{
          maxWidth: expanded ? 1160 : 292,
          margin: expanded ? '0 auto' : 0,
          transform: expanded ? 'translateY(0)' : 'translateY(4px)',
          opacity: 1,
          transition: 'max-width 0.42s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.3s ease',
        }}
      >
        <div className={rixMsgs.length > 0 ? 'rix-hero-collapsed' : 'rix-hero-visible'} style={{
          display: 'grid',
          gridTemplateColumns: expanded && !isMobile ? '210px minmax(0, 1fr)' : '1fr',
          gap: expanded ? 18 : 16,
          alignItems: 'center',
          marginBottom: isRixConversationOpen ? (rixMsgs.length > 0 ? 6 : 10) : (expanded ? 18 : 22),
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'relative',
            minHeight: expanded ? (isMobile ? 122 : 176) : 112,
            borderRadius: expanded ? 22 : 20,
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible',
            boxShadow: 'none',
            opacity: isRixConversationOpen ? 0.72 : 1,
            transform: isRixConversationOpen && expanded ? 'scale(0.86)' : 'scale(1)',
            transition: 'opacity 0.42s ease, transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            <img
              src="/rix-saludando.png"
              alt="Rix saludando"
              style={{
                width: expanded ? (isMobile ? 116 : 174) : 128,
                maxWidth: '100%',
                height: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 18px 18px rgba(31, 41, 55, 0.14))',
                transform: expanded ? 'translateY(4px)' : 'translateY(2px)',
              }}
            />
          </div>

          <div style={{ textAlign: expanded && !isMobile ? 'left' : 'center' }}>
            <h1 style={{
              margin: 0,
              color: 'var(--t, #111827)',
              fontSize: expanded ? (isMobile ? 27 : 36) : 26,
              lineHeight: 1,
              letterSpacing: '-0.03em',
              fontWeight: 900,
              maxWidth: expanded ? 900 : 380,
            }}>
              Rix para decisiones clínicas.
            </h1>
            <p style={{
              maxWidth: 900,
              margin: '12px 0 0',
              color: 'var(--t-s, #6b7280)',
              fontSize: expanded ? 14 : 13,
              lineHeight: 1.5,
            }}>
              Rix conecta contexto de pacientes, tratamientos y alertas en una conversación pensada para equipos médicos.
            </p>
          </div>
        </div>

        {expanded && (
          <>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: showHistoryPanel || showGroupsPanel ? 12 : 14,
              justifyContent: isMobile ? 'stretch' : 'flex-start',
            }}>
              <button
                type="button"
                onClick={() => setShowHistoryPanel(current => !current)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 12px',
                  borderRadius: 999,
                  border: showHistoryPanel ? '1px solid var(--p, #6d32e8)' : '1px solid var(--br, #e5e7eb)',
                  background: showHistoryPanel ? 'color-mix(in srgb, var(--p, #6d32e8) 9%, #ffffff)' : 'var(--sf, #ffffff)',
                  color: showHistoryPanel ? 'var(--p, #6d32e8)' : 'var(--t-s, #6b7280)',
                  fontSize: 12,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                <Clock size={14} />
                {showHistoryPanel ? 'Ocultar chats' : 'Ver chats con Rix'}
              </button>
              <button
                type="button"
                onClick={() => setShowGroupsPanel(current => !current)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 12px',
                  borderRadius: 999,
                  border: showGroupsPanel ? '1px solid var(--p, #6d32e8)' : '1px solid var(--br, #e5e7eb)',
                  background: showGroupsPanel ? 'color-mix(in srgb, var(--p, #6d32e8) 9%, #ffffff)' : 'var(--sf, #ffffff)',
                  color: showGroupsPanel ? 'var(--p, #6d32e8)' : 'var(--t-s, #6b7280)',
                  fontSize: 12,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                <Users size={14} />
                {showGroupsPanel ? 'Ocultar grupos' : 'Ver chats grupales'}
              </button>
            </div>

            {(showHistoryPanel || showGroupsPanel) && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : showHistoryPanel && showGroupsPanel ? 'minmax(0, 1fr) minmax(280px, 0.72fr)' : '1fr',
                gap: 14,
                marginBottom: 16,
                animation: 'rixPanelReveal 0.34s cubic-bezier(0.16, 1, 0.3, 1)',
              }}>
                {showHistoryPanel && <div style={{
              borderRadius: 20,
              border: '1px solid var(--br, #e5e7eb)',
              background: 'rgba(255,255,255,0.78)',
              padding: 14,
              boxShadow: '0 14px 36px rgba(15,23,42,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--t, #111827)' }}>Chats con Rix</div>
                <Clock size={16} color="var(--t-s, #6b7280)" />
              </div>
	              <div style={{ display: 'grid', gap: 8 }}>
	                {chats.map(chat => {
                  const selected = chat.id === activeRixChat;
                  return (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => {
                        setActiveRixChat(chat.id);
                        if (chat.msgs?.length) {
                          setRixMsgs(chat.msgs);
                          setIsRixConversationOpen(true);
                          setShowHistoryPanel(false);
                        }
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: 12,
                        borderRadius: 14,
                        border: selected ? '1px solid color-mix(in srgb, var(--p, #6d32e8) 38%, transparent)' : '1px solid var(--br, #e5e7eb)',
                        background: selected ? 'color-mix(in srgb, var(--p, #6d32e8) 8%, #ffffff)' : 'var(--sf, #ffffff)',
                        cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--t, #111827)' }}>{chat.title}</span>
                        <span style={{ fontSize: 11, color: 'var(--t-s, #6b7280)', whiteSpace: 'nowrap' }}>{chat.meta}</span>
                      </div>
                      <div style={{ marginTop: 6, fontSize: 12, lineHeight: 1.45, color: 'var(--t-s, #6b7280)' }}>{chat.excerpt}</div>
                    </button>
                  );
	                })}
	                {chats.length === 0 && <EmptyInline text="No hay chats con Rix devueltos por el servidor." />}
	              </div>
	              {activeChat && <div style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 14,
                background: 'var(--b, #f8fafc)',
                border: '1px solid var(--br, #e5e7eb)',
                fontSize: 12,
                lineHeight: 1.45,
                color: 'var(--t-s, #6b7280)',
              }}>
	                <strong style={{ color: 'var(--t, #111827)' }}>{activeChat.title}:</strong> {activeChat.excerpt || 'Sin resumen disponible.'}
	              </div>
	              }
                </div>}

                {showGroupsPanel && <div style={{
              borderRadius: 20,
              border: '1px solid var(--br, #e5e7eb)',
              background: 'rgba(255,255,255,0.78)',
              padding: 14,
              boxShadow: '0 14px 36px rgba(15,23,42,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--t, #111827)' }}>Chats grupales</div>
                  <div style={{ marginTop: 3, fontSize: 12, color: 'var(--t-s, #6b7280)' }}>Sesiones compartidas con médicos</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGroupComposer(current => !current)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    border: 'none',
                    background: 'var(--p, #6d32e8)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title="Crear chat grupal"
                >
                  <Plus size={18} />
                </button>
              </div>

              <EmptyInline text="Los chats grupales se sincronizan vía WebSocket." />

              {showGroupComposer && (
                <div style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 16,
                  background: 'var(--b, #f8fafc)',
                  border: '1px solid var(--br, #e5e7eb)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, fontWeight: 900, color: 'var(--t, #111827)' }}>
                    <UserPlus size={16} />
                    Agregar invitados
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
	                    {doctors.map(doctor => {
	                      const selected = selectedDoctors.includes(doctor.id);
                      return (
                        <button
	                          key={doctor.id}
	                          type="button"
	                          onClick={() => toggleDoctor(doctor.id)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 999,
                            border: selected ? '1px solid var(--p, #6d32e8)' : '1px solid var(--br, #e5e7eb)',
                            background: selected ? 'color-mix(in srgb, var(--p, #6d32e8) 10%, #ffffff)' : 'var(--sf, #ffffff)',
                            color: selected ? 'var(--p, #6d32e8)' : 'var(--t-s, #6b7280)',
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
	                          {doctor.name}
	                        </button>
	                      );
	                    })}
	                    {doctors.length === 0 && <EmptyInline text="No hay médicos disponibles." />}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 11, color: 'var(--t-s, #6b7280)', lineHeight: 1.45 }}>{selectedDoctorSummary}</div>
                  <button type="button" style={{
                    marginTop: 12,
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'var(--t, #111827)',
                    color: 'var(--sf, #ffffff)',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}>
                    Crear sesión grupal
                  </button>
                </div>
              )}
                </div>}
              </div>
            )}
          </>
        )}

        <div style={{
          background: 'var(--sf, #ffffff)',
          border: '1px solid var(--br, #e5e7eb)',
          borderRadius: expanded ? 22 : 18,
          boxShadow: isRixConversationOpen ? '0 22px 70px rgba(109,50,232,0.14)' : (expanded ? '0 18px 55px rgba(0,0,0,0.08)' : '0 8px 24px rgba(0,0,0,0.05)'),
          padding: expanded ? 18 : 14,
          minHeight: isRixConversationOpen ? (isMobile ? 430 : 420) : 'auto',
          transform: isRixConversationOpen ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'min-height 0.56s cubic-bezier(0.16, 1, 0.3, 1), transform 0.56s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.3s ease, box-shadow 0.3s ease',
        }}>
          {isRixConversationOpen && (
            <div ref={msgsRef} style={{
              display: 'flex', flexDirection: 'column', gap: 6,
              marginBottom: 12, maxHeight: isMobile ? '70vh' : '80vh', minHeight: isRixConversationOpen ? (isMobile ? 180 : 200) : 'auto', overflowY: 'auto',
              animation: 'rixPanelReveal 0.34s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
              {rixMsgs.length === 0 && !thinking && (
                <EmptyInline text="Escribe tu consulta clínica y Rix te responderá con MiniMax M2.7." />
              )}
              {rixMsgs.map((m, i) => {
                const isUser = m.role === 'user';
                return (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                }}>
                  {m.thinking && <ThinkingBubble text={m.thinking} />}
                  <div style={{
                    maxWidth: '85%', padding: isUser ? '10px 14px' : '14px 18px',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isUser ? 'var(--p, #6d32e8)' : 'var(--sf, #ffffff)',
                    border: isUser ? 'none' : '1px solid var(--br, #e5e7eb)',
                    boxShadow: isUser ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                    color: isUser ? '#ffffff' : 'var(--t, #111827)',
                    fontSize: 13, lineHeight: 1.55,
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }} dangerouslySetInnerHTML={isUser ? undefined : { __html: renderMarkdown(m.text) }}>
                    {isUser ? m.text : null}
                  </div>
                </div>
                );
              })}
              {thinking && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--p, #6d32e8)',
                    animation: 'rixPulse 1.5s ease-in-out infinite',
                  }} />
                  <span style={{ fontSize: 12, color: 'var(--t-s)', opacity: 0.6, fontStyle: 'italic' }}>
                    Pensando...
                  </span>
                </div>
              )}
              <style>{`
                @keyframes rixPulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
                @keyframes rixHeroOut {
                  0% { opacity:1; max-height:220px; transform:translateY(0) scale(1); }
                  100% { opacity:0; max-height:0; transform:translateY(-30px) scale(0.9); }
                }
                .rix-hero-collapsed { animation: rixHeroOut 0.8s cubic-bezier(0.4,0,0.2,1) forwards; max-height:0 !important; opacity:0 !important; }
                .rix-hero-visible { max-height: 220px; opacity: 1; }
              `}</style>
            </div>
          )}
          {attachments.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 0 6px' }}>
              {attachments.map((a, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px',
                  borderRadius: 6, fontSize: 10, background: 'var(--b)', border: '1px solid var(--br)',
                  color: 'var(--t)', fontWeight: 600,
                }}>
                  {a.type.startsWith('image/') ? '🖼️' : '📎'} {a.name.length > 20 ? a.name.slice(0, 18) + '..' : a.name}
                  <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t-s)', fontSize: 11, padding: 0, lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
          )}
          <input ref={fileRef} type="file" onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*,.pdf,.txt,.csv,.json,.md,.doc,.docx" />

          {/* Unified input container */}
          <div className="rix-input-container" style={{
            border: '1px solid var(--br, #e5e7eb)',
            borderRadius: 18,
            background: 'var(--sf, #ffffff)',
            padding: '10px 14px 8px',
          }}>
          <textarea
            ref={taRef}
            value={rixPrompt}
            onChange={(e) => setRixPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendRixMessage(); } }}
            placeholder="Escribe tu consulta para Rix..."
            rows={1}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--t, #111827)',
              fontFamily: "'Inter', sans-serif",
              fontSize: expanded ? 15 : 13,
              lineHeight: 1.55,
              boxSizing: 'border-box',
              resize: 'none',
              overflow: 'hidden',
              minHeight: 28,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <button type="button" onClick={() => {
                if (proMode) { setConvHistory([]); setRixMsgs([]); setProMode(false); setIsRixConversationOpen(false); setShowHistoryPanel(true); setShowGroupsPanel(true); }
                else setProMode(true);
              }}
              title={proMode ? 'Desactivar Modo Pro (nueva sesión)' : 'Activar Modo Pro'} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 8,
                border: proMode ? '1px solid #f59e0b' : '1px solid var(--br, #e5e7eb)',
                background: proMode ? 'rgba(245,158,11,0.08)' : 'var(--b, #f8fafc)',
                color: proMode ? '#d97706' : 'var(--t-s, #6b7280)',
                fontSize: 10, fontWeight: 700, cursor: 'pointer',
              }}>
              <Sparkles size={12} />
              Modo Pro
              {proMode && <span style={{ fontSize: 8, background: '#f59e0b', color: '#fff', padding: '1px 4px', borderRadius: 3, fontWeight: 800 }}>PRO</span>}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button type="button" onClick={() => fileRef.current?.click()} title="Adjuntar archivo" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: 10, border: '1px solid var(--br)',
                background: 'var(--sf)', color: 'var(--t-s)', cursor: 'pointer',
              }}>
                <Paperclip size={15} />
              </button>
              <button type="button" aria-label="Enviar" onClick={sendRixMessage} style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 12, border: 'none',
                background: rixPrompt.trim() || attachments.length > 0 ? 'var(--p, #3b82f6)' : 'var(--br)',
                color: rixPrompt.trim() || attachments.length > 0 ? '#ffffff' : 'var(--t-s)',
                cursor: rixPrompt.trim() || attachments.length > 0 ? 'pointer' : 'default',
                transition: 'background 0.2s',
              }}>
                <Send size={16} />
              </button>
            </div>
          </div>
          </div>
          {rixSubmitStatus && <div style={{ marginTop: 10 }}><EmptyInline text={rixSubmitStatus} /></div>}
	        </div>

        {expanded && !isRixConversationOpen && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
            gap: 14,
            marginTop: 40,
          }}>
            {[
              ['Alertas críticas', 'Resume los eventos pendientes del turno.'],
              ['Paciente concreto', 'Busca contexto clínico por nombre o código.'],
              ['Tratamiento activo', 'Explica estado, dosis y próximos pasos.'],
            ].map(([title, text]) => (
              <div key={title} style={{
                padding: 18,
                borderRadius: 16,
                background: 'var(--b, #f8fafc)',
                border: '1px solid var(--br, #e5e7eb)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t, #111827)' }}>{title}</div>
                  <ArrowUpRight size={16} color="var(--t-s, #6b7280)" />
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 12, lineHeight: 1.5, color: 'var(--t-s, #6b7280)' }}>{text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PatientCalendarModal({
  open,
  patients,
  selectedPatient,
  onSelectedPatientChange,
  onClose,
  isMobile,
}: {
  open: boolean;
  patients: CalendarPatient[];
  selectedPatient: string;
  onSelectedPatientChange: (patientId: string) => void;
  onClose: () => void;
  isMobile: boolean;
}) {
  if (!open) return null;

  const visiblePatients = patients.filter(patient => patient.id !== 'todos' && (selectedPatient === 'todos' || patient.id === selectedPatient));
  const monthDays = Array.from({ length: 35 }, (_, index) => index - 0);

  const dateToDay = (value: string) => Number(value.split('-')[2]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Calendario de pacientes"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isMobile ? 0 : 24,
        background: 'rgba(15, 23, 42, 0.32)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <button
        type="button"
        aria-label="Cerrar calendario"
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
      />
      <div style={{
        position: 'relative',
        width: isMobile ? '100%' : 'min(920px, calc(100vw - 48px))',
        maxHeight: isMobile ? '88dvh' : 'min(720px, calc(100dvh - 48px))',
        overflow: 'auto',
        borderRadius: isMobile ? '24px 24px 0 0' : 28,
        border: '1px solid var(--br, #e5e7eb)',
        background: 'var(--sf, #ffffff)',
        boxShadow: '0 28px 90px rgba(15,23,42,0.22)',
        padding: isMobile ? 18 : 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10, color: 'var(--p, #7c3aed)', fontSize: 12, fontWeight: 900 }}>
              <Calendar size={16} />
              Rango clínico
            </div>
            <h2 style={{ margin: 0, color: 'var(--t, #111827)', fontSize: isMobile ? 24 : 30, lineHeight: 1.05, fontWeight: 900, letterSpacing: '-0.02em' }}>
              Calendario de pacientes
            </h2>
            <p style={{ margin: '8px 0 0', color: 'var(--t-s, #6b7280)', fontSize: 13, lineHeight: 1.5 }}>
              Carga los tratamientos activos de los pacientes.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            border: '1px solid var(--br, #e5e7eb)',
            background: 'var(--b, #f8fafc)',
            color: 'var(--t, #111827)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <X size={18} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '240px minmax(0, 1fr)',
          gap: 18,
        }}>
          <div style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--t, #111827)' }}>Filtrar por paciente</div>
            {patients.map(patient => {
              const active = selectedPatient === patient.id;
              return (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => onSelectedPatientChange(patient.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 14,
                    border: active ? '1px solid color-mix(in srgb, var(--p, #7c3aed) 42%, transparent)' : '1px solid var(--br, #e5e7eb)',
                    background: active ? 'color-mix(in srgb, var(--p, #7c3aed) 8%, #ffffff)' : 'var(--b, #f8fafc)',
                    color: active ? 'var(--t, #111827)' : 'var(--t-s, #6b7280)',
                    fontSize: 12,
                    fontWeight: 800,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: patient.color, flexShrink: 0 }} />
                  {patient.name}
                </button>
              );
            })}
          </div>

          <div style={{
            borderRadius: 22,
            border: '1px solid var(--br, #e5e7eb)',
            background: 'var(--b, #f8fafc)',
            padding: isMobile ? 12 : 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--t, #111827)' }}>Mayo 2023</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t-s, #6b7280)' }}>{visiblePatients.length} rangos visibles</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6, marginBottom: 6 }}>
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                <div key={day} style={{ textAlign: 'center', fontSize: 11, fontWeight: 900, color: 'var(--t-s, #6b7280)' }}>{day}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 }}>
              {monthDays.map((_, index) => {
                const day = index + 1 <= 31 ? index + 1 : null;
                const matching = day ? visiblePatients.filter(patient => {
                  const start = dateToDay(patient.start);
                  const end = dateToDay(patient.end);
                  return day >= start && day <= end;
                }) : [];
                return (
                  <div key={index} style={{
                    minHeight: isMobile ? 42 : 54,
                    borderRadius: 12,
                    border: '1px solid var(--br, #e5e7eb)',
                    background: day ? 'var(--sf, #ffffff)' : 'transparent',
                    padding: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}>
                    {day && <div style={{ fontSize: 11, fontWeight: 900, color: day === 16 ? 'var(--p, #7c3aed)' : 'var(--t, #111827)' }}>{day}</div>}
                    {matching.slice(0, 3).map(patient => (
                      <span key={patient.id} title={patient.name} style={{
                        height: 5,
                        borderRadius: 999,
                        background: patient.color,
                        opacity: 0.86,
                      }} />
                    ))}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
              {visiblePatients.map(patient => (
                <div key={patient.id} style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) auto auto',
                  gap: isMobile ? 4 : 12,
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: 14,
                  background: 'var(--sf, #ffffff)',
                  border: '1px solid var(--br, #e5e7eb)',
                  fontSize: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, color: 'var(--t, #111827)' }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: patient.color }} />
                    {patient.name}
                  </div>
                  <div style={{ color: 'var(--t-s, #6b7280)', fontWeight: 800 }}>Inicio: {patient.start}</div>
                  <div style={{ color: 'var(--t-s, #6b7280)', fontWeight: 800 }}>Fin: {patient.end}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfilePage({ userName, userRole, userId, userEmail }: { userName: string; userRole: string; userId?: number; userEmail?: string }) {
  const [profile, setProfile] = useState<ApiUser | null>(null);
  const [form, setForm] = useState({
    firstName: userName,
    lastName: '',
    email: userEmail || '',
    phone: '',
    licenseNumber: '',
    specialty: '',
  });
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [status, setStatus] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');

  useEffect(() => {
    if (!userId) return;
    users.getById(userId)
      .then((data) => {
        setProfile(data);
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          licenseNumber: data.licenseNumber || '',
          specialty: data.specialty || '',
        });
      })
      .catch(() => setStatus('No se pudo cargar el perfil.'));
  }, [userId]);

  const saveProfile = async () => {
    if (!userId) {
      setStatus('La sesión no tiene un ID de usuario válido.');
      return;
    }

    try {
      const updated = await users.update(userId, form);
      setProfile(updated);
      setStatus('Perfil actualizado.');
    } catch {
      setStatus('No se pudo guardar el perfil.');
    }
  };

  const resetPassword = async () => {
    if (!userId) {
      setPasswordStatus('La sesión no tiene un ID de usuario válido.');
      return;
    }
    if (!passwordForm.next || passwordForm.next.length < 8) {
      setPasswordStatus('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordStatus('Las contraseñas no coinciden.');
      return;
    }

    try {
      await users.update(userId, { password: passwordForm.next });
      setPasswordForm({ current: '', next: '', confirm: '' });
      setPasswordStatus('Contraseña actualizada.');
    } catch {
      setPasswordStatus('No se pudo actualizar la contraseña.');
    }
  };

  const displayName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : userName;
  const initials = displayName.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'R';

  return (
    <div style={{ display: 'grid', gap: 18, maxWidth: 1080 }}>
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'auto minmax(0, 1fr) auto',
        gap: 18,
        alignItems: 'center',
        padding: 24,
        borderRadius: 24,
        background: 'var(--sf, #ffffff)',
        border: '1px solid var(--br, #e5e7eb)',
        boxShadow: '0 18px 50px rgba(15,23,42,0.06)',
      }}>
        <div style={{
          width: 82,
          height: 82,
          borderRadius: 24,
          background: 'linear-gradient(135deg, var(--p, #7c3aed), #0ea5e9)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          fontWeight: 900,
        }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 28, lineHeight: 1.05, fontWeight: 900, color: 'var(--t, #111827)', letterSpacing: '-0.02em' }}>{displayName}</div>
          <div style={{ marginTop: 8, fontSize: 14, color: 'var(--t-s, #6b7280)', fontWeight: 700 }}>{userRole}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            {['Sesión activa', profile?.email || userEmail || 'Email no disponible', profile?.specialty || 'Especialidad sin asignar'].map(item => (
              <span key={item} style={{
                padding: '7px 10px',
                borderRadius: 999,
                background: 'color-mix(in srgb, var(--p, #7c3aed) 8%, #ffffff)',
                border: '1px solid color-mix(in srgb, var(--p, #7c3aed) 18%, transparent)',
                color: 'var(--p, #7c3aed)',
                fontSize: 11,
                fontWeight: 900,
              }}>
                {item}
              </span>
            ))}
          </div>
        </div>
        <button type="button" onClick={saveProfile} style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '11px 16px',
          borderRadius: 14,
          border: 'none',
          background: 'var(--p, #7c3aed)',
          color: '#ffffff',
          fontSize: 13,
          fontWeight: 900,
          cursor: 'pointer',
        }}>
          <Save size={15} />
          Guardar perfil
        </button>
      </section>

      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 14,
      }}>
        <ProfileCard icon={User} title="Información personal" subtitle="Datos sincronizados con /api/users/{id}.">
          <ProfileInput label="Nombre" value={form.firstName} onChange={(value) => setForm({ ...form, firstName: value })} />
          <ProfileInput label="Apellidos" value={form.lastName} onChange={(value) => setForm({ ...form, lastName: value })} />
          <ProfileInput label="Email institucional" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
          <ProfileInput label="Teléfono" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
        </ProfileCard>

        <ProfileCard icon={Shield} title="Perfil clínico" subtitle="Datos profesionales visibles para administración y coordinación.">
          <ProfileInput label="Rol" value={profile?.role || userRole} onChange={(value) => setProfile(prev => prev ? { ...prev, role: value } : prev)} disabled />
          <ProfileInput label="Especialidad" value={form.specialty} onChange={(value) => setForm({ ...form, specialty: value })} />
          <div style={{ padding: 12, borderRadius: 14, background: 'var(--b, #f8fafc)', color: 'var(--t-s, #6b7280)', fontSize: 12, lineHeight: 1.45 }}>
            La pertenencia a departamentos y pacientes asignados se gestiona desde Usuarios.
          </div>
        </ProfileCard>

        <ProfileCard icon={KeyRound} title="Seguridad" subtitle="Restablece tu contraseña sin permitir eliminar la cuenta.">
          <ProfileInput label="Contraseña actual" type="password" value={passwordForm.current} onChange={(value) => setPasswordForm({ ...passwordForm, current: value })} />
          <ProfileInput label="Nueva contraseña" type="password" value={passwordForm.next} onChange={(value) => setPasswordForm({ ...passwordForm, next: value })} />
          <ProfileInput label="Confirmar contraseña" type="password" value={passwordForm.confirm} onChange={(value) => setPasswordForm({ ...passwordForm, confirm: value })} />
          <button type="button" onClick={resetPassword} style={{
            padding: '11px 14px',
            borderRadius: 14,
            border: 'none',
            background: 'var(--t, #111827)',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 900,
            cursor: 'pointer',
          }}>
            Resetear contraseña
          </button>
          <div style={{ padding: 12, borderRadius: 14, background: 'rgba(239,68,68,0.08)', color: '#b91c1c', fontSize: 12, fontWeight: 800 }}>
            La eliminación de cuenta no está disponible desde Mi perfil.
          </div>
        </ProfileCard>

        <ProfileCard icon={Activity} title="Actividad y sesión" subtitle="Resumen de tu actividad en la plataforma.">
          <InfoLine label="ID de usuario" value={String(userId || profile?.id || 'No disponible')} />
          <InfoLine label="Creado" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleString('es-ES') : 'No disponible'} />
          <InfoLine label="Email" value={profile?.email || userEmail || 'No disponible'} />
          <InfoLine label="Estado" value="Cuenta activa" />
          {(status || passwordStatus) && (
            <div style={{ padding: 12, borderRadius: 14, background: 'color-mix(in srgb, var(--p, #7c3aed) 8%, #ffffff)', color: 'var(--p, #7c3aed)', fontSize: 12, fontWeight: 900 }}>
              {status || passwordStatus}
            </div>
          )}
        </ProfileCard>
      </section>
    </div>
  );
}

function ProfileCard({ icon: Icon, title, subtitle, children }: { icon: typeof User; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'grid',
      gap: 12,
      alignContent: 'start',
      padding: 20,
      borderRadius: 20,
      background: 'var(--sf, #ffffff)',
      border: '1px solid var(--br, #e5e7eb)',
      boxShadow: '0 14px 40px rgba(15,23,42,0.05)',
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: 'color-mix(in srgb, var(--p, #7c3aed) 9%, #ffffff)', color: 'var(--p, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={17} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--t, #111827)' }}>{title}</div>
          <p style={{ margin: '5px 0 0', fontSize: 12, lineHeight: 1.45, color: 'var(--t-s, #6b7280)' }}>{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function ProfileInput({ label, value, onChange, type = 'text', disabled = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; disabled?: boolean }) {
  const id = `profile-${label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', marginBottom: 6, fontSize: 11, fontWeight: 900, color: 'var(--t-s, #6b7280)' }}>{label}</label>
      <input id={id} type={type} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: '11px 12px',
        borderRadius: 14,
        border: '1px solid var(--br, #e5e7eb)',
        background: disabled ? 'var(--b, #f8fafc)' : 'var(--sf, #ffffff)',
        color: disabled ? 'var(--t-s, #6b7280)' : 'var(--t, #111827)',
        fontSize: 13,
        fontWeight: 700,
        outline: 'none',
      }} />
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--br, #e5e7eb)' }}>
      <span style={{ color: 'var(--t-s, #6b7280)', fontSize: 12, fontWeight: 800 }}>{label}</span>
      <span style={{ color: 'var(--t, #111827)', fontSize: 12, fontWeight: 900, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function roundToggleStyle(offset: number, side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    [side]: offset,
    top: 40,
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'var(--sf, #ffffff)',
    border: '1px solid var(--br, #f3f4f6)',
    boxShadow: '0 8px 22px rgba(15,23,42,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 140,
    color: 'var(--t-s, #6b7280)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
  };
}

const plainIconButtonStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: '50%',
  background: 'transparent',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--t-s, #9ca3af)',
  cursor: 'pointer',
};
