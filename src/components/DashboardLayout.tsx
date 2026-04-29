'use client';

import { useEffect, useMemo, useState } from 'react';
import ThemeProvider from './ThemeProvider';
import ConfigurationPage from './ConfigurationPage';
import RadixLogo from './RadixLogo';
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
  MoreVertical,
  Paperclip,
  Phone,
  Plus,
  Send,
  Settings,
  Shield,
  Smile,
  Sparkles,
  Stethoscope,
  UserPlus,
  Users,
  Video,
} from 'lucide-react';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  userName: string;
  userRole: string;
  configPage?: 'configuration' | 'patients' | 'treatments' | 'devices' | 'rix';
}

type RightPanelTab = 'chat' | 'rix';

export default function DashboardLayout({ children, userName, userRole, configPage }: DashboardLayoutProps) {
  return (
    <ThemeProvider>
      <DashboardLayoutInner {...{ children, userName, userRole, configPage }} />
    </ThemeProvider>
  );
}

function DashboardLayoutInner({ children, userName, userRole, configPage }: DashboardLayoutProps) {
  const isRixRoute = configPage === 'rix';
  const [activeRightTab, setActiveRightTab] = useState<RightPanelTab>(isRixRoute ? 'rix' : 'chat');
  const [isRixExpanding, setIsRixExpanding] = useState(isRixRoute);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNav] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('pacientes')) return 'pacientes';
      if (path.includes('tratamientos')) return 'tratamientos';
      if (path.includes('alertas')) return 'alertas';
      if (path.includes('usuarios')) return 'usuarios';
      if (path.includes('facultativos')) return 'facultativos';
      if (path.includes('configuracion')) return 'settings';
      if (path.includes('rix')) return 'rix';
    }
    if (configPage === 'configuration') return 'settings';
    if (configPage === 'rix') return 'rix';
    return 'home';
  });

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

  const isMobile = viewportWidth < 760;
  const isCompact = viewportWidth < 1180;
  const leftColumnPx = !isMobile && isLeftSidebarOpen ? 240 : 0;
  const compactRightPx = !isMobile && isRightSidebarOpen ? Math.min(340, Math.max(300, Math.round(viewportWidth * 0.3))) : 0;
  const gridTemplateColumns = assistantExpanded
    ? `${leftColumnPx}px minmax(0, 0px) minmax(0, 1fr)`
    : `${leftColumnPx}px minmax(0, 1fr) ${compactRightPx}px`;

  const headerContent = {
    home: { title: `Hola, ${userName}`, subtitle: 'Sigue el progreso general de la clínica médica aquí.' },
    pacientes: { title: 'Gestión de Pacientes', subtitle: 'Administra y registra los pacientes y sus datos.' },
    tratamientos: { title: 'Tratamientos Activos', subtitle: 'Controla los planes de medicina nuclear en curso.' },
    alertas: { title: 'Centro de Alertas', subtitle: 'Avisos y notificaciones médicas urgentes.' },
    usuarios: { title: 'Usuarios del Sistema', subtitle: 'Administra los roles y accesos a la plataforma.' },
    facultativos: { title: 'Cuadro Médico', subtitle: 'Directorio de doctores y especialistas.' },
    settings: { title: 'Configuración', subtitle: 'Ajusta tus preferencias visuales y de cuenta.' },
    rix: { title: 'Rix', subtitle: 'Asistente de IA de Radix.' },
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
      <LeftSidebar
        activeNav={activeNav}
        activeRightTab={activeRightTab}
        isOpen={isMobile ? isMobileMenuOpen : isLeftSidebarOpen}
        isMobile={isMobile}
        onChatClick={() => {
          openInternalChat();
          setIsMobileMenuOpen(false);
        }}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div
        style={{
          gridColumn: 2,
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
        {!isMobile && <button
          onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
          style={roundToggleStyle(isLeftSidebarOpen ? -14 : 14, 'left')}
          title={isLeftSidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
        >
          {isLeftSidebarOpen ? <ChevronLeft size={16} strokeWidth={2.5} /> : <ChevronRight size={16} strokeWidth={2.5} />}
        </button>}

        {!isMobile && <button
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
            padding: isMobile ? '20px 16px 84px' : (isCompact ? '28px 28px' : '32px 40px'),
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {isMobile && (
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
              <div style={{ fontSize: isMobile ? 12 : 13, fontWeight: 600, color: 'var(--t-s, #4b5563)', whiteSpace: 'nowrap' }}>16 May, 2023</div>
              <div style={{
                width: isMobile ? 34 : 36,
                height: isMobile ? 34 : 36,
                borderRadius: 10,
                background: 'var(--sf, #f3f4f6)',
                border: '1px solid var(--br, transparent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--t, #111827)',
              }}>
                <Calendar size={16} strokeWidth={2} />
              </div>
            </div>
          </div>

          {configPage === 'configuration' ? <ConfigurationPage /> : children}
        </main>
      </div>

      <RightAssistantColumn
        expanded={assistantExpanded}
        open={isRightSidebarOpen}
        isMobile={isMobile}
        activeTab={activeRightTab}
        chatExpanded={isChatExpanded}
        onChatClick={openInternalChat}
        onRixClick={launchRix}
        onToggleChatExpanded={toggleInternalChatExpanded}
        onOpenFloating={openMobileAssistant}
        onCloseMobile={closeMobileAssistant}
      />
    </div>
  );
}

function LeftSidebar({
  activeNav,
  activeRightTab,
  isOpen,
  isMobile,
  onChatClick,
  onCloseMobile,
}: {
  activeNav: string;
  activeRightTab: RightPanelTab;
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
    { id: 'facultativos', label: 'Facultativos', icon: Stethoscope, href: '/facultativos' },
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
              ? activeRightTab === 'chat'
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

        <div style={{ padding: '0 16px 24px' }}>
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

  return (
    <>
      {isOpen && (
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
      )}
      {sidebar}
    </>
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
          bottom: 18,
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
        gridColumn: 3,
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
  return (
    <>
      <div style={{ padding: isMobile ? '16px 16px 0' : '24px 24px 0' }}>
        <div style={{
          background: 'var(--b, #f8fafc)',
          border: '1px solid var(--br, transparent)',
          borderRadius: 20,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <img
              src="https://i.pravatar.cc/150?img=47"
              alt="Megan Norton"
              style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: 'var(--p, #10b981)',
              border: '2px solid var(--b, #f8fafc)',
            }} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t, #111827)' }}>Megan Norton</div>
          <div style={{ fontSize: 13, color: 'var(--t-s, #9ca3af)', marginTop: 2, marginBottom: 20 }}>@megnorton</div>

          <div style={{ display: 'flex', gap: 12 }}>
            {[Phone, Video, MoreVertical].map((Icon, i) => (
              <button key={i} style={circleButtonStyle}>
                <Icon size={18} strokeWidth={2} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: isMobile ? '24px 16px 12px' : '32px 24px 16px', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--br, #f3f4f6)' }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t-s, #4b5563)' }}>Chat interno</div>
          <div style={{ flex: 1, height: 1, background: 'var(--br, #f3f4f6)' }} />
        </div>
        <ChatMessage name="Floyd Miles" img="11" time="10:15 AM" text="He actualizado la ficha de aislamiento. Revisa la dosis antes de cerrar turno." />
        <ChatMessage name="Guy Hawkins" img="3" time="10:18 AM" text="Paciente estable. El reloj ya está sincronizando métricas." online />
        <ChatMessage name="Kristin Watson" img="9" time="10:21 AM" text="Necesito validar la próxima revisión de radiación." />
      </div>

      <div style={{ padding: isMobile ? '12px 16px 16px' : '16px 24px 24px' }}>
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
        </div>
      </div>
    </>
  );
}

function ChatMessage({ name, img, time, text, online }: { name: string; img: string; time: string; text: string; online?: boolean }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ position: 'relative' }}>
          <img src={`https://i.pravatar.cc/150?img=${img}`} alt={name} style={{ width: 36, height: 36, borderRadius: '50%' }} />
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

function RixPanel({ expanded, isMobile }: { expanded: boolean; isMobile: boolean }) {
  const previousRixChats = [
    { id: 'turno', title: 'Resumen del turno', meta: 'Hoy, 12 mensajes', excerpt: 'Alertas pendientes y pacientes con revisión activa.' },
    { id: 'dosis', title: 'Dudas de dosimetría', meta: 'Ayer, 8 mensajes', excerpt: 'Cálculo de actividad y recomendaciones por tratamiento.' },
    { id: 'seguimiento', title: 'Seguimiento post-terapia', meta: 'Lun, 5 mensajes', excerpt: 'Síntomas reportados y próximos controles.' },
  ];
  const doctors = ['Dra. Elena Ruiz', 'Dr. Marc Vidal', 'Dra. Inés Ferrer', 'Dr. Pablo Torres'];
  const [activeRixChat, setActiveRixChat] = useState(previousRixChats[0].id);
  const [showGroupComposer, setShowGroupComposer] = useState(false);
  const [isRixConversationOpen, setIsRixConversationOpen] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(true);
  const [showGroupsPanel, setShowGroupsPanel] = useState(true);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>(['Dra. Elena Ruiz']);
  const activeChat = previousRixChats.find(chat => chat.id === activeRixChat) || previousRixChats[0];
  const selectedDoctorSummary = selectedDoctors.length ? selectedDoctors.join(', ') : 'Sin invitados seleccionados';

  const toggleDoctor = (doctor: string) => {
    setSelectedDoctors((current) => current.includes(doctor)
      ? current.filter(item => item !== doctor)
      : [...current, doctor]);
  };

  const sendRixMessage = () => {
    setIsRixConversationOpen(true);
    setShowHistoryPanel(false);
    setShowGroupsPanel(false);
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
              </div>
              <div style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 14,
                background: 'var(--b, #f8fafc)',
                border: '1px solid var(--br, #e5e7eb)',
                fontSize: 12,
                lineHeight: 1.45,
                color: 'var(--t-s, #6b7280)',
              }}>
                <strong style={{ color: 'var(--t, #111827)' }}>{activeChat.title}:</strong> {activeChat.excerpt}
              </div>
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

              <button type="button" style={{
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
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--t, #111827)' }}>Comité de terapia I-131</span>
                  <span style={{ fontSize: 11, color: 'var(--p, #6d32e8)', fontWeight: 800 }}>3 médicos</span>
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: 'var(--t-s, #6b7280)' }}>Revisión compartida con Rix y equipo clínico.</div>
              </button>

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
                      const selected = selectedDoctors.includes(doctor);
                      return (
                        <button
                          key={doctor}
                          type="button"
                          onClick={() => toggleDoctor(doctor)}
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
                          {doctor}
                        </button>
                      );
                    })}
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
              <div style={{
                maxWidth: '72%',
                padding: '12px 14px',
                borderRadius: '16px 16px 16px 4px',
                background: 'var(--b, #f8fafc)',
                border: '1px solid var(--br, #e5e7eb)',
                color: 'var(--t, #111827)',
                fontSize: 13,
                lineHeight: 1.5,
              }}>
                ¿Qué necesitas revisar ahora?
              </div>
              <div style={{
                justifySelf: 'end',
                maxWidth: '74%',
                padding: '12px 14px',
                borderRadius: '16px 16px 4px 16px',
                background: 'var(--p, #6d32e8)',
                color: '#ffffff',
                fontSize: 13,
                lineHeight: 1.5,
              }}>
                Necesito contexto clínico del turno y próximos pasos.
              </div>
              <div style={{
                maxWidth: '78%',
                padding: '12px 14px',
                borderRadius: '16px 16px 16px 4px',
                background: 'color-mix(in srgb, var(--p, #6d32e8) 7%, #ffffff)',
                border: '1px solid color-mix(in srgb, var(--p, #6d32e8) 18%, transparent)',
                color: 'var(--t, #111827)',
                fontSize: 13,
                lineHeight: 1.5,
              }}>
                Perfecto. He plegado el historial y los grupos para dejar más espacio de conversación. Puedes desplegarlos arriba cuando los necesites.
              </div>
            </div>
          )}
          <textarea
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

const circleButtonStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: '50%',
  background: 'var(--sf, #ffffff)',
  border: '1px solid var(--br, transparent)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--t, #111827)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  cursor: 'pointer',
};

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
