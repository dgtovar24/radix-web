'use client';

import React, { Component, useEffect, useMemo, useState } from 'react';
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
import {
  Activity,
  ArrowUpRight,
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
  configPage?: 'configuration' | 'patients' | 'treatments' | 'devices' | 'rix' | 'profile';
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

export default function DashboardLayout({ children, userName, userRole, userId, userEmail, configPage }: DashboardLayoutProps) {
  return (
    <ThemeProvider>
      <DashboardLayoutInner {...{ children, userName, userRole, userId, userEmail, configPage }} />
    </ThemeProvider>
  );
}

function DashboardLayoutInner({ children, userName, userRole, userId, userEmail, configPage }: DashboardLayoutProps) {
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
    }
    if (configPage === 'configuration') return 'settings';
    if (configPage === 'rix') return 'rix';
    if (configPage === 'profile') return 'profile';
    return 'home';
  };

  const [activeNav, setActiveNav] = useState(() => {
    if (configPage === 'configuration') return 'settings';
    if (configPage === 'rix') return 'rix';
    if (configPage === 'profile') return 'profile';
    return 'home';
  });

  useEffect(() => {
    setActiveNav(resolveActiveNav());
  }, [configPage]);

  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('radix_right_sidebar');
      return stored !== null ? stored === 'true' : true;
    }
    return true;
  });

  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('radix_left_sidebar');
      return stored !== null ? stored === 'true' : true;
    }
    return true;
  });
  const [viewportWidth, setViewportWidth] = useState(1440);

  useEffect(() => {
    localStorage.setItem('radix_right_sidebar', String(isRightSidebarOpen));
  }, [isRightSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('radix_left_sidebar', String(isLeftSidebarOpen));
  }, [isLeftSidebarOpen]);

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
      setIsRightSidebarOpen(true);
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
    setIsRightSidebarOpen(true);
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
    const keepExpanded = isRixExpanding || isChatExpanded || (typeof window !== 'undefined' && window.location.pathname === '/rix');
    setActiveRightTab('chat');
    setIsRightSidebarOpen(true);
    setIsChatExpanded(keepExpanded);
    if (typeof window !== 'undefined') {
      window.scrollTo({ left: 0, top: 0 });
    }
    setIsRixExpanding(false);
  };

  const toggleInternalChatExpanded = () => {
    setActiveRightTab('chat');
    setIsRightSidebarOpen(true);
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
    setIsRightSidebarOpen(true);
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
  const compactRightPx = !useOverlayPanels && isRightSidebarOpen ? Math.min(340, Math.max(300, Math.round(viewportWidth * 0.3))) : 0;
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
    settings: { title: 'Configuración', subtitle: 'Ajusta tus preferencias visuales y de cuenta.' },
    rix: { title: 'Rix', subtitle: 'Asistente de IA de Radix.' },
    profile: { title: 'Mi perfil', subtitle: 'Gestiona tu identidad y la sesión activa.' },
  };

  const currentHeader = headerContent[activeNav as keyof typeof headerContent] || headerContent.home;

  return (
    <div
      data-radix-shell="true"
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
          onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          style={roundToggleStyle(isRightSidebarOpen ? -14 : 14, 'right')}
          title={isRightSidebarOpen ? 'Ocultar panel' : 'Mostrar panel'}
        >
          {isRightSidebarOpen ? <ChevronRight size={16} strokeWidth={2.5} /> : <ChevronLeft size={16} strokeWidth={2.5} />}
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
        open={isRightSidebarOpen}
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
}: {
  activeNav: string;
  activeRightTab: RightPanelTab;
  chatExpanded: boolean;
  isOpen: boolean;
  isMobile: boolean;
  onChatClick: () => void;
  onCloseMobile: () => void;
}) {
  const navItems = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'pacientes', label: 'Pacientes', icon: Users, href: '/pacientes' },
    { id: 'tratamientos', label: 'Tratamientos', icon: Activity, href: '/tratamientos' },
    { id: 'alertas', label: 'Alertas', icon: Bell, href: '/alertas' },
    { id: 'usuarios', label: 'Usuarios', icon: Shield, href: '/usuarios' },
    { id: 'chat', label: 'Chat interno', icon: MessageCircle, onClick: onChatClick },
    { id: 'rix', label: 'Rix', icon: Bot, href: '/rix' },
    { id: 'settings', label: 'Configuración', icon: Settings, href: '/configuracion' },
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

            return 'onClick' in item ? (
              <button key={item.id} type="button" onClick={item.onClick} style={commonStyle}>
                {content}
              </button>
            ) : (
              <a
                key={item.id}
                href={item.href}
                style={commonStyle}
              >
                {content}
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
                A
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--t, #111827)' }}>Admin Radix</div>
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
    { id: 'pacientes', label: 'Pacientes', icon: Users, href: '/pacientes' },
    { id: 'tratamientos', label: 'Tratamientos', icon: Activity, href: '/tratamientos' },
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
        {activeTab === 'rix' ? <RixPanel expanded={expanded} isMobile={isMobile} /> : <InternalChatPanel isMobile={isMobile} />}
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

function InternalChatPanel({ isMobile }: { isMobile: boolean }) {
  const [directoryUsers, setDirectoryUsers] = useState<InternalChatUser[]>([]);
  const [directChats, setDirectChats] = useState<InternalConversation[]>([]);
  const [groupChats, setGroupChats] = useState<InternalConversation[]>([]);
  const [chatMessages, setChatMessages] = useState<InternalMessage[]>([]);
  const [directoryTab, setDirectoryTab] = useState<'usuarios' | 'chats' | 'grupales'>('usuarios');
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | number>('');
  const [chatStatus, setChatStatus] = useState('');
  const [draftMessage, setDraftMessage] = useState('');
  const { connected, messages: wsMessages, sendMessage } = useWebSocketChat();

  useEffect(() => {
    let active = true;
    const loadChatData = async () => {
      try {
        const apiUsers = await users.getAll();
        const directory = apiUsers.map((user) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`.trim() || user.email,
          role: user.role,
          status: 'offline',
        }));
        if (!active) return;
        setDirectoryUsers(directory);
        setSelectedUser((current) => current || directory[0]?.id || '');
        setChatStatus('');
      } catch (error) {
        if (active) setChatStatus('No se pudieron cargar los datos del chat interno desde la API.');
      }
    };
    loadChatData();
    return () => { active = false; };
  }, []);

  const filteredUsers = directoryUsers.filter(user =>
    `${user.name} ${user.role || ''}`.toLowerCase().includes(query.toLowerCase())
  );
  const selectedUserData = directoryUsers.find(user => user.id === selectedUser);

  return (
    <>
      <div style={{ padding: isMobile ? '16px 16px 0' : '24px 24px 0' }}>
        <div style={{
          background: 'var(--b, #f8fafc)',
          border: '1px solid var(--br, transparent)',
          borderRadius: 20,
          padding: 14,
          display: 'grid',
          gap: 12,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 6,
            padding: 4,
            borderRadius: 14,
            background: 'var(--sf, #ffffff)',
            border: '1px solid var(--br, #e5e7eb)',
          }}>
            {[
              ['usuarios', 'Usuarios', Users],
              ['chats', 'Chats', MessageCircle],
              ['grupales', 'Grupales', UserPlus],
            ].map(([id, label, Icon]) => {
              const active = directoryTab === id;
              const TabIcon = Icon as typeof Users;
              return (
                <button
                  key={id as string}
                  type="button"
                  onClick={() => setDirectoryTab(id as 'usuarios' | 'chats' | 'grupales')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    minHeight: 34,
                    border: 'none',
                    borderRadius: 10,
                    background: active ? 'color-mix(in srgb, var(--p, #7c3aed) 10%, #ffffff)' : 'transparent',
                    color: active ? 'var(--p, #7c3aed)' : 'var(--t-s, #6b7280)',
                    fontSize: 11,
                    fontWeight: 900,
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <TabIcon size={14} />
                  <span>{label as string}</span>
                </button>
              );
            })}
          </div>

          {directoryTab === 'usuarios' && (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 14,
                border: '1px solid var(--br, #e5e7eb)',
                background: 'var(--sf, #ffffff)',
                padding: '8px 10px',
              }}>
                <Search size={15} color="var(--t-s, #6b7280)" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar usuario..."
                  style={{
                    minWidth: 0,
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: 'var(--t, #111827)',
                    fontSize: 12,
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
              </div>
              <div style={{ display: 'grid', gap: 8, maxHeight: isMobile ? 220 : 190, overflowY: 'auto' }}>
                {filteredUsers.map(user => {
                  const selected = user.id === selectedUser;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedUser(user.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        width: '100%',
                        padding: 10,
                        borderRadius: 14,
                        border: selected ? '1px solid color-mix(in srgb, var(--p, #7c3aed) 42%, transparent)' : '1px solid var(--br, #e5e7eb)',
                        background: selected ? 'color-mix(in srgb, var(--p, #7c3aed) 8%, #ffffff)' : 'var(--sf, #ffffff)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                        <img src={getAvatarUrl(user)} alt={user.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--t, #111827)' }}>{user.name}</div>
                        <div style={{ marginTop: 2, fontSize: 11, color: 'var(--t-s, #6b7280)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.role}</div>
                      </div>
	                      <span style={{ fontSize: 10, fontWeight: 800, color: user.status === 'Disponible' ? 'var(--sc, #10b981)' : 'var(--t-s, #6b7280)' }}>{user.status || 'Usuario'}</span>
                    </button>
                  );
                })}
              </div>
	              {filteredUsers.length === 0 && <EmptyInline text={chatStatus || 'No hay usuarios disponibles desde la API.'} />}
	              <button type="button" disabled={!selectedUserData} onClick={() => {
                  if (!selectedUserData) return;
                  setDirectoryTab('chats');
                  setChatStatus('');
                  if (chatMessages.length === 0) {
                    setChatMessages([{
                      id: `local-welcome-${selectedUserData.id}`,
                      senderName: selectedUserData.name,
                      senderAvatarId: selectedUserData.id,
                      senderAvatarUrl: selectedUserData.avatarUrl,
                      messageText: 'Conversación iniciada. Escribe un mensaje para continuar.',
                      sentAt: new Date().toISOString(),
                    }]);
                  }
                }} style={{
                width: '100%',
                border: 'none',
                borderRadius: 14,
                padding: '11px 14px',
                background: 'var(--p, #7c3aed)',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 900,
	                cursor: selectedUserData ? 'pointer' : 'not-allowed',
	                opacity: selectedUserData ? 1 : 0.55,
                fontFamily: "'Inter', sans-serif",
              }}>
	                {selectedUserData ? `Chatear con ${selectedUserData.name}` : 'Selecciona un usuario'}
              </button>
            </>
          )}

          {directoryTab !== 'usuarios' && (
            <div style={{ display: 'grid', gap: 8 }}>
	              {(directoryTab === 'chats' ? directChats : groupChats).map(chat => (
                <button
                  key={chat.id}
                  type="button"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: 12,
                    borderRadius: 14,
                    border: '1px solid var(--br, #e5e7eb)',
                    background: 'var(--sf, #ffffff)',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--t, #111827)' }}>{chat.title}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--p, #7c3aed)', whiteSpace: 'nowrap' }}>{chat.meta}</span>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 11, lineHeight: 1.45, color: 'var(--t-s, #6b7280)' }}>{chat.excerpt}</div>
                </button>
	              ))}
	              {(directoryTab === 'chats' ? directChats : groupChats).length === 0 && (
	                <EmptyInline text={directoryTab === 'chats' ? 'No hay chats directos devueltos por la API.' : 'No hay chats grupales devueltos por la API.'} />
	              )}
              {directoryTab === 'grupales' && (
                <button type="button" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  border: '1px solid var(--br, #e5e7eb)',
                  borderRadius: 14,
                  padding: '10px 12px',
                  background: 'var(--t, #111827)',
                  color: 'var(--sf, #ffffff)',
                  fontSize: 12,
                  fontWeight: 900,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}>
                  <Plus size={15} />
                  Nuevo chat grupal
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: isMobile ? '24px 16px 12px' : '32px 24px 16px', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--br, #f3f4f6)' }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t-s, #4b5563)' }}>Chat interno</div>
          <div style={{ flex: 1, height: 1, background: 'var(--br, #f3f4f6)' }} />
        </div>
        {chatMessages.map((message) => (
          <ChatMessage
            key={message.id}
            name={message.senderName}
            img={message.senderAvatarId || message.id}
            avatarUrl={message.senderAvatarUrl}
            time={formatTime(message.sentAt)}
            text={message.messageText}
            online={message.online}
          />
        ))}
        {chatMessages.length === 0 && <EmptyInline text={chatStatus || 'No hay mensajes cargados desde la API para esta conversación.'} />}
      </div>

      <form onSubmit={(event) => {
        event.preventDefault();
        const text = draftMessage.trim();
        if (!text) return;
        const optimisticMessage: any = {
          id: `local-${Date.now()}`,
          senderName: 'Tú',
          messageText: text,
          sentAt: new Date().toISOString(),
          online: true,
        };
        const sent = sendMessage(text, 'Tú');
        if (sent) {
          setChatMessages((current) => [...current, optimisticMessage]);
        } else {
          setChatStatus('No se pudo enviar. Conecta el chat.');
        }
        setDraftMessage('');
      }} style={{ padding: isMobile ? '12px 16px 16px' : '16px 24px 24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--b, #f8fafc)',
          border: '1px solid var(--br, transparent)',
          borderRadius: 99,
          padding: '6px 6px 6px 16px',
          gap: 8,
        }}>
          <Paperclip size={16} color="var(--t-s)" />
          <input
            type="text"
            value={draftMessage}
            onChange={(event) => setDraftMessage(event.target.value)}
            placeholder="Escribe un mensaje"
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              padding: '8px 0',
              fontSize: 13,
              color: 'var(--t, #111827)',
              outline: 'none',
              fontFamily: "'Inter', sans-serif",
            }}
          />
          <button style={plainIconButtonStyle}><Smile size={18} /></button>
          <button style={plainIconButtonStyle}><Mic size={18} /></button>
          <button type="submit" disabled={!draftMessage.trim()} style={{
            ...plainIconButtonStyle,
            background: draftMessage.trim() ? 'var(--p, #7c3aed)' : 'transparent',
            color: draftMessage.trim() ? '#ffffff' : 'var(--t-s, #6b7280)',
            cursor: draftMessage.trim() ? 'pointer' : 'not-allowed',
          }}><Send size={17} /></button>
        </div>
      </form>
    </>
  );
}

function ChatMessage({ name, img, avatarUrl, time, text, online }: { name: string; img: string | number; avatarUrl?: string; time: string; text: string; online?: boolean }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ position: 'relative' }}>
          <img src={avatarUrl || `https://i.pravatar.cc/150?img=${img}`} alt={name} style={{ width: 36, height: 36, borderRadius: '50%' }} />
          {online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: 'var(--p, #10b981)', border: '2px solid var(--sf, #ffffff)' }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t, #111827)' }}>{name}</div>
            <div style={{ fontSize: 11, color: 'var(--t-s, #9ca3af)' }}>{time}</div>
          </div>
          <div style={{
            marginTop: 8,
            background: 'var(--b, #eff6ff)',
            border: '1px solid var(--br, transparent)',
            borderRadius: '0 16px 16px 16px',
            padding: '12px 14px',
            fontSize: 13,
            color: 'var(--t, #1f2937)',
            lineHeight: 1.5,
          }}>
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyInline({ text }: { text: string }) {
  return (
    <div style={{
      padding: '12px 14px',
      borderRadius: 14,
      border: '1px dashed var(--br, #e5e7eb)',
      background: 'color-mix(in srgb, var(--b, #f8fafc) 82%, #ffffff)',
      color: 'var(--t-s, #6b7280)',
      fontSize: 12,
      lineHeight: 1.45,
    }}>
      {text}
    </div>
  );
}

function getAvatarUrl(user: InternalChatUser) {
  if (user.avatarUrl) return user.avatarUrl;
  const numeric = Number(user.id);
  const avatarId = Number.isFinite(numeric) ? (numeric % 70) + 1 : 1;
  return `https://i.pravatar.cc/150?img=${avatarId}`;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function RixPanel({ expanded, isMobile }: { expanded: boolean; isMobile: boolean }) {
  const [previousRixChats, setPreviousRixChats] = useState<RixConversation[]>([]);
  const [rixGroups, setRixGroups] = useState<RixGroup[]>([]);
  const [doctors, setDoctors] = useState<RixDoctor[]>([]);
  const [activeRixChat, setActiveRixChat] = useState<string | number>('');
  const [showGroupComposer, setShowGroupComposer] = useState(false);
  const [isRixConversationOpen, setIsRixConversationOpen] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(true);
  const [showGroupsPanel, setShowGroupsPanel] = useState(true);
  const [selectedDoctors, setSelectedDoctors] = useState<Array<string | number>>([]);
  const [rixPrompt, setRixPrompt] = useState('');
  const [rixSubmitStatus, setRixSubmitStatus] = useState('');
  const { sendQuery } = useWebSocketRix();
  const activeChat = previousRixChats.find(chat => chat.id === activeRixChat);
  const selectedDoctorSummary = selectedDoctors.length
    ? doctors.filter((doctor) => selectedDoctors.includes(doctor.id)).map((doctor) => doctor.name).join(', ')
    : 'Sin invitados seleccionados';

  useEffect(() => {
    let active = true;
    const loadRixData = async () => {
      const apiUsers = await users.getAll().catch(() => []);
      const doctorList = apiUsers
        .filter((user) => ['admin', 'facultativo', 'doctor', 'Doctor'].includes(user.role))
        .map((user) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`.trim() || user.email,
          specialty: user.specialty || user.role,
        }));
      const conversations = previousRixChats;
      const groups = [];
      if (!active) return;
      setPreviousRixChats(conversations);
      setRixGroups(groups);
      setDoctors(doctorList);
      setActiveRixChat((current) => current || conversations[0]?.id || '');
    };
    loadRixData();
    return () => { active = false; };
  }, []);

  const toggleDoctor = (doctor: string | number) => {
    setSelectedDoctors((current) => current.includes(doctor)
      ? current.filter(item => item !== doctor)
      : [...current, doctor]);
  };

  const sendRixMessage = () => {
    setIsRixConversationOpen(true);
    setShowHistoryPanel(false);
    setShowGroupsPanel(false);
    if (!rixPrompt.trim()) return;
    const sent = sendQuery(rixPrompt.trim());
    if (sent) {
      setRixSubmitStatus('');
    } else {
      setRixSubmitStatus('No se pudo enviar. El WebSocket de Rix no está conectado.');
    }
    setRixPrompt('');
  };

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
        <div style={{
          display: 'grid',
          gridTemplateColumns: expanded && !isMobile ? '210px minmax(0, 1fr)' : '1fr',
          gap: expanded ? 18 : 16,
          alignItems: 'center',
          marginBottom: isRixConversationOpen ? 10 : (expanded ? 18 : 22),
          transition: 'margin 0.42s ease, opacity 0.42s ease',
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
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 10px',
              borderRadius: 999,
              background: 'color-mix(in srgb, var(--p, #6d32e8) 10%, #ffffff)',
              border: '1px solid color-mix(in srgb, var(--p, #6d32e8) 18%, transparent)',
              color: 'var(--p, #6d32e8)',
              fontSize: 12,
              fontWeight: 800,
              marginBottom: 14,
            }}>
              <Sparkles size={14} />
              Rix online
            </div>
            <h1 style={{
              margin: 0,
              color: 'var(--t, #111827)',
              fontSize: expanded ? (isMobile ? 27 : 36) : 26,
              lineHeight: 1,
              letterSpacing: '-0.03em',
              fontWeight: 900,
              maxWidth: expanded ? 470 : 292,
            }}>
              Rix para decisiones clínicas.
            </h1>
            <p style={{
              maxWidth: 520,
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
	                {previousRixChats.map(chat => {
                  const selected = chat.id === activeRixChat;
                  return (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => setActiveRixChat(chat.id)}
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
	                {previousRixChats.length === 0 && <EmptyInline text="No hay chats con Rix devueltos por la API." />}
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

	              {rixGroups.map((group) => (
	                <button key={group.id} type="button" style={{
	                  width: '100%',
	                  textAlign: 'left',
	                  padding: 12,
	                  borderRadius: 14,
	                  border: '1px solid var(--br, #e5e7eb)',
	                  background: 'var(--sf, #ffffff)',
	                  cursor: 'pointer',
	                  fontFamily: "'Inter', sans-serif",
	                }}>
	                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
	                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--t, #111827)' }}>{group.title}</span>
	                    <span style={{ fontSize: 11, color: 'var(--p, #6d32e8)', fontWeight: 800 }}>{group.meta || `${group.participantCount || 0} médicos`}</span>
	                  </div>
	                  <div style={{ marginTop: 6, fontSize: 12, color: 'var(--t-s, #6b7280)' }}>{group.excerpt || 'Sesión grupal sin resumen disponible.'}</div>
	                </button>
	              ))}
	              {rixGroups.length === 0 && <EmptyInline text="No hay chats grupales de Rix devueltos por la API." />}

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
	                    {doctors.length === 0 && <EmptyInline text="No hay médicos disponibles desde la API." />}
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
            <div style={{
              display: 'grid',
              gap: 12,
              marginBottom: 14,
              animation: 'rixPanelReveal 0.34s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
	              <EmptyInline text="La conversación de Rix se cargará desde la API cuando el backend devuelva mensajes." />
            </div>
          )}
          <textarea
            value={rixPrompt}
            onChange={(event) => setRixPrompt(event.target.value)}
            placeholder="Escribe tu consulta para Rix..."
            style={{
              width: '100%',
              minHeight: isRixConversationOpen ? (isMobile ? 170 : 160) : (expanded ? 118 : 92),
              resize: 'vertical',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--t, #111827)',
              fontFamily: "'Inter', sans-serif",
              fontSize: expanded ? 15 : 13,
              lineHeight: 1.55,
              boxSizing: 'border-box',
            }}
          />
	          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 12 }}>
            <button type="button" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 12px',
              borderRadius: 12,
              border: '1px solid var(--br, #e5e7eb)',
              background: 'var(--b, #f8fafc)',
              color: 'var(--t, #111827)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}>
              <Sparkles size={15} />
              Pensar mejor
            </button>
	            <button type="button" aria-label="Enviar mensaje a Rix" onClick={sendRixMessage} style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 14,
              border: 'none',
              background: 'var(--p, #3b82f6)',
              color: '#ffffff',
              cursor: 'pointer',
	            }}>
	              <Send size={17} />
	            </button>
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
              Visualiza inicio y fin de seguimiento por paciente usando pacientes y tratamientos de la API.
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
      .catch(() => setStatus('No se pudo cargar el perfil desde la API.'));
  }, [userId]);

  const saveProfile = async () => {
    if (!userId) {
      setStatus('La sesión no tiene un ID de usuario válido.');
      return;
    }

    try {
      const updated = await users.update(userId, form);
      setProfile(updated);
      setStatus('Perfil actualizado desde la API.');
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
      setPasswordStatus('Contraseña actualizada en la API.');
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
          <ProfileInput label="Número de colegiado" value={form.licenseNumber} onChange={(value) => setForm({ ...form, licenseNumber: value })} />
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

        <ProfileCard icon={Activity} title="Actividad y sesión" subtitle="Resumen de información recibida desde la sesión y la API.">
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
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 10,
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
