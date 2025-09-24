

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { getFilteredMenuItems, getMenuItemsByCategory } from "@/config/navigation";
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
  Users,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CompanySelector from "@/components/auth/CompanySelector";
import { CompanyProvider } from "@/components/common/CompanyContext";
import { motion } from "framer-motion";

// Componente para renderizar item de menu
const MenuItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleClick = (e) => {
    if (item.children) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    } else {
      // Permitir navegação normal para links sem filhos
      onClick?.();
    }
  };

  return (
    <div>
      <Link
        to={item.children ? '#' : item.path}
        onClick={handleClick}
        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
          isActive ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--color-muted)] hover:bg-[var(--color-primary)]/5 hover:text-[var(--color-foreground)]'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="flex-1 text-sm font-medium">{item.title}</span>
        {item.children && (
          isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
        )}
      </Link>
      
      {item.children && isExpanded && (
        <div className="ml-8 mt-2 space-y-1">
          {item.children.map((child) => (
            <MenuItem
              key={child.id}
              item={child}
              isActive={location.pathname === child.path}
              onClick={onClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const { hasPermission } = usePermissions();
  const [currentCompany, setCurrentCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // CORREÇÃO DEFINITIVA: Forçar empresa CBA com ID real do Supabase
    const cbaCompany = {
      id: '68cacb913d169d191be6c90d', // ID real da CBA no Supabase
      name: 'CBA - Santarém (Matriz)',
      full_name: 'CBA - Santarém (Matriz)',
      city: 'Santarém',
      state: 'PA',
      code: 'CBA',
      type: 'matriz',
      active: true
    };
    
    setCurrentCompany(cbaCompany);
    localStorage.setItem('selectedCompany', JSON.stringify(cbaCompany));
    setLoading(false);
  }, []);

  // Mapear o role do Supabase para os roles do sistema
  const mapSupabaseRoleToSystemRole = (supabaseRole) => {
    const roleMap = {
      'admin': 'Administrador',
      'usuario_padrao': 'Operador de Balança',
      'gerente_patio': 'Gerente de Pátio',
      'almoxarife': 'Almoxarife'
    };
    return roleMap[supabaseRole] || 'Operador de Balança';
  };

  const currentUser = user && profile ? {
    ...user,
    full_name: profile.full_name || user.email,
    role: mapSupabaseRoleToSystemRole(profile.role),
    active: true
  } : null;

  const handleCompanySelect = (company) => {
    setCurrentCompany(company);
    try {
      localStorage.setItem('selectedCompany', JSON.stringify(company));
    } catch (error) {
      console.warn("Erro ao salvar empresa no localStorage:", error);
    }
  };

  // Obter itens de navegação filtrados baseado no role do usuário
  const userRole = profile?.role; // Usar o role original do Supabase
  const isSuperAdmin = profile?.role === 'super_admin';
  const navigationItems = getFilteredMenuItems(userRole, isSuperAdmin);
  const menuItemsByCategory = getMenuItemsByCategory(userRole, isSuperAdmin);
  
  // Todos os usuários têm acesso total - debug removido

  if (loading || authLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
          <div className="text-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"
            />
            <p className="text-white/80 text-lg">Carregando sistema...</p>
          </div>
        </div>
      );
  }

  // Se não há empresa selecionada, mostrar seletor
  if (!currentCompany) {
    return <CompanySelector onCompanySelect={handleCompanySelect} currentUser={currentUser} />;
  }

  return (
    <CompanyProvider company={currentCompany}>
      <style>{`
        /* ================================
           THEME – ANDRES TECHNOLOGIES
           ================================ */

        /* --- Tema Claro --- */
        :root {
          /* Brand */
          --color-primary: #6A4BFF;           /* Roxo vibrante */
          --color-primary-dark: #2B0E5A;      /* Roxo escuro */
          --color-primary-foreground: #FFFFFF;

          /* Accent */
          --color-accent: #8B5CF6;            /* Roxo claro */
          --color-accent-foreground: #FFFFFF;

          /* Neutros */
          --color-bg: #F9FAFB;
          --color-surface: #FFFFFF;
          --color-border: #E5E7EB;
          --color-muted: #6B7280;
          --color-foreground: #1A1A1A;

          /* Estados */
          --color-success: #22C55E;
          --color-warning: #F59E0B;
          --color-danger:  #EF4444;
          --color-info:    #3B82F6;

          /* Interações */
          --color-hover:   #5A3FE0;
          --color-focus:   #A78BFA;

          /* UI */
          --radius: 14px;
          --shadow: 0 8px 24px rgba(2, 6, 23, 0.08);
        }

        /* --- Tema Escuro --- */
        .theme-dark {
          --color-bg: #0F0A1F;
          --color-surface: #1E1533;
          --color-border: #2B1F45;
          --color-foreground: #F3F4F6;
          --color-muted: #9CA3AF;

          --color-primary: #8B5CF6;
          --color-primary-foreground: #0F0A1F;

          --color-accent: #C084FC;
          --color-accent-foreground: #0F0A1F;

          --shadow: 0 8px 28px rgba(0,0,0,0.28);
        }

        body {
            background-color: var(--color-bg);
            color: var(--color-foreground);
        }

        .btn-primary {
            background-color: var(--color-primary);
            color: var(--color-primary-foreground);
            border-radius: calc(var(--radius) - 6px);
            font-weight: 600;
        }
        .btn-primary:hover {
            background-color: var(--color-hover);
        }
      `}</style>
      <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--color-bg)] text-[var(--color-foreground)]">
        {/* Mobile Header */}
        <div className="lg:hidden bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/73861b5e8_ANDRESTECHPRINCIPAL.png"
                alt="Andres Technologies"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="font-bold text-[var(--color-foreground)] text-lg">Andres One</h2>
              <p className="text-xs text-[var(--color-muted)]">{currentCompany.name}</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-[var(--color-bg)] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[var(--color-foreground)]" /> : <Menu className="w-6 h-6 text-[var(--color-foreground)]" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
            <div className="bg-[var(--color-surface)] w-80 h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-white shadow-lg">
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/73861b5e8_ANDRESTECHPRINCIPAL.png"
                      alt="Andres Technologies"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="font-bold text-[var(--color-foreground)] text-lg">Andres One</h2>
                    <p className="text-xs text-[var(--color-muted)] font-medium">{currentCompany.name}</p>
                  </div>
                </div>
              </div>

              <div className="p-3">
                <div className="mb-6">
                  <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider px-3 py-2 mb-1">
                    Navegação Principal
                  </p>
                  <div className="space-y-1">
                    {navigationItems.map((item) => (
                      <MenuItem
                        key={item.id}
                        item={item}
                        isActive={location.pathname === item.path}
                        onClick={() => setMobileMenuOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-[var(--color-border)] p-4 mt-auto">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary)] rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--color-foreground)] text-sm truncate">{currentUser?.full_name || "Usuário"}</p>
                    <p className="text-xs text-[var(--color-muted)] truncate">{currentCompany.name}</p>
                  </div>
                </div>
                <div className="space-y-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-[var(--color-border)] hover:bg-[var(--color-primary)]/10 text-[var(--color-foreground)]"
                    onClick={() => {
                      localStorage.removeItem('selectedCompany');
                      setCurrentCompany(null);
                      setMobileMenuOpen(false); // Close mobile menu after action
                    }}
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Trocar Filial
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700"
                    onClick={() => {
                      localStorage.removeItem('selectedCompany');
                      setCurrentCompany(null);
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-80 lg:flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)]">
          <div className="border-b border-[var(--color-border)] p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-white shadow-lg">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/73861b5e8_ANDRESTECHPRINCIPAL.png"
                  alt="Andres Technologies"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="font-bold text-[var(--color-foreground)] text-lg">Andres One</h2>
                <p className="text-xs text-[var(--color-muted)] font-medium">{currentCompany.name}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-3 overflow-y-auto">
            <div className="mb-8">
              <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider px-3 py-2 mb-1">
                Navegação Principal
              </p>
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    isActive={location.pathname === item.path}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--color-border)] p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary)] rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--color-foreground)] text-sm truncate">{currentUser?.full_name || "Usuário"}</p>
                <p className="text-xs text-[var(--color-muted)] truncate">{currentUser?.role || "Função não definida"}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-[var(--color-border)] hover:bg-[var(--color-primary)]/10 text-[var(--color-foreground)]"
                onClick={() => {
                  localStorage.removeItem('selectedCompany');
                  setCurrentCompany(null);
                }}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Trocar Filial
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700"
                onClick={() => {
                  localStorage.removeItem('selectedCompany');
                  setCurrentCompany(null);
                  signOut();
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </CompanyProvider>
  );
}

