import React, { useState, useEffect } from 'react';
import {
  Heart,
  Truck,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  Lock,
  ChevronDown,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Building2,
  ArrowRight,
  LogOut,
  Info,
  Droplet,
  KeyRound,
  ShieldAlert,
  Clock,
  Menu,
  Construction,
  Hammer,
  Layers,
  ArrowLeft,
  Calendar,
  FlaskConical,
  BellRing
} from 'lucide-react';

// ==========================================
// UTILS & MASKS
// ==========================================
const formatCPF = (value) => {
  if (!value) return '';
  const d = value.replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const formatPhone = (value) => {
  if (!value) return '';
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
};

// ==========================================
// LOGO COMPONENT
// ==========================================
const LeiteFlowLogo = ({ variant = 'default', size = 'md', className = '' }) => {
  const isDark = variant === 'dark';
  const sizeClass =
    size === 'sm' ? 'h-8' : size === 'lg' ? 'h-14' : size === 'xl' ? 'h-20' : 'h-10';

  if (isDark) {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <div className="bg-white/95 px-3 py-1.5 rounded-xl shadow-sm flex items-center">
          <img
            src="/logo.png"
            alt="LeiteFlow"
            className={`${sizeClass} w-auto object-contain`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/logo.png"
        alt="LeiteFlow"
        className={`${sizeClass} w-auto object-contain`}
      />
    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function App() {
  // Navigation View: 'home' | 'login' | 'dashboard'
  const [currentView, setCurrentView] = useState('home');

  // Modals & User Sessions
  const [activeModal, setActiveModal] = useState(null); // 'quero-doar' | 'admin-login' | 'admin-dashboard' | null
  const [userSession, setUserSession] = useState(null);
  const [adminSession, setAdminSession] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form States
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });
  const [loginErr, setLoginErr] = useState('');
  const [adminForm, setAdminForm] = useState({ matricula: '', chaveSeguranca: '', senha: '' });
  const [adminErr, setAdminErr] = useState('');

  // Donor Express Registration Form (Quero Doar)
  const [donorForm, setDonorForm] = useState({
    nome: '',
    telefone: '',
    zonaMarilia: 'Zona Sul',
    bairro: '',
  });
  const [donorErr, setDonorErr] = useState('');

  // Simulator & FAQ State
  const [mlPerDay, setMlPerDay] = useState(150);
  const [faqOpen, setFaqOpen] = useState(null);

  // Handle URL hashes (#login, #admin-blh)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#login') {
        setCurrentView('login');
      } else if (hash === '#admin-blh') {
        setActiveModal('admin-login');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Lock body scroll on modal
  useEffect(() => {
    document.body.style.overflow = activeModal ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeModal]);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ------------------------------------------
  // DONOR REGISTRATION (QUERO DOAR -> ENVIA PRO SISTEMA)
  // ------------------------------------------
  const handleDonorSubmit = (e) => {
    e.preventDefault();
    setDonorErr('');

    if (!donorForm.nome.trim() || donorForm.nome.trim().split(' ').length < 2) {
      setDonorErr('Por favor, informe seu nome e sobrenome.');
      return;
    }

    const rawPhone = donorForm.telefone.replace(/\D/g, '');
    if (rawPhone.length < 10) {
      setDonorErr('Informe um WhatsApp/Telefone válido com DDD.');
      return;
    }

    if (!donorForm.bairro.trim()) {
      setDonorErr('Informe o seu bairro em Marília.');
      return;
    }

    const protocolNumber = `BLH-MAR-${Math.floor(100000 + Math.random() * 900000)}`;
    const newSession = {
      nome: donorForm.nome.trim(),
      cpf: 'Cadastrada no Sistema Express',
      email: 'Aguardando contato via WhatsApp',
      telefone: donorForm.telefone,
      bairro: donorForm.bairro.trim(),
      zonaMarilia: donorForm.zonaMarilia,
      protocolo: protocolNumber,
      dataCadastro: new Date().toLocaleDateString('pt-BR'),
      status: 'Doadora Cadastrada • Aguardando Coleta BLH',
    };

    setUserSession(newSession);
    setActiveModal(null);
    setCurrentView('dashboard');
    showToast(`Cadastro enviado com sucesso para o sistema! Protocolo: ${protocolNumber}`);
  };

  // ------------------------------------------
  // LOGIN SUBMIT
  // ------------------------------------------
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginErr('');

    if (!loginForm.identifier.trim() || !loginForm.password.trim()) {
      setLoginErr('Por favor, preencha seu CPF ou E-mail e senha.');
      return;
    }

    const isCPF = /^\d/.test(loginForm.identifier);
    const mockUser = {
      nome: 'Mariana Silva Alencar',
      cpf: isCPF ? formatCPF(loginForm.identifier) : '384.920.118-45',
      email: isCPF ? 'mariana.alencar@email.com' : loginForm.identifier,
      telefone: '(14) 99842-1020',
      bairro: 'Jardim Esmeralda',
      zonaMarilia: 'Zona Sul',
      protocolo: 'BLH-MAR-849201',
      dataCadastro: '12/10/2026',
      status: 'Acesso Liberado • Sistema em Construção',
    };

    setUserSession(mockUser);
    setCurrentView('dashboard');
    window.location.hash = '';
    showToast('Login realizado com sucesso! Bem-vinda ao sistema.');
  };

  const handleFillDemoLogin = () => {
    setLoginForm({
      identifier: 'mariana.alencar@email.com',
      password: 'senha123456',
    });
    setLoginErr('');
  };

  const handleLogout = () => {
    setUserSession(null);
    setCurrentView('home');
    setLoginForm({ identifier: '', password: '' });
    window.location.hash = '';
    showToast('Sessão encerrada com sucesso.');
  };

  // ------------------------------------------
  // ADMIN AUTH
  // ------------------------------------------
  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    setAdminErr('');
    const mat = adminForm.matricula.trim().toLowerCase();
    const token = adminForm.chaveSeguranca.trim().toUpperCase();

    if (
      (mat === 'admin@hc.famema.br' || mat === '202688') &&
      token === 'BLH-2026-MARILIA' &&
      adminForm.senha.trim() === 'admin'
    ) {
      setAdminSession({
        nome: 'Dra. Cleyde Moerbeck Casadei',
        cargo: 'Coordenadora Técnica BLH Marília / HCFAMEMA',
        matricula: 'HC-94021',
        nivelAcesso: 'Administrador Master',
        dataHora: new Date().toLocaleString('pt-BR'),
      });
      setActiveModal('admin-dashboard');
      showToast('Autenticação de Administrador autorizada!', 'admin');
    } else {
      setAdminErr('Credenciais institucionais inválidas. Verifique os dados fornecidos.');
    }
  };

  // ==========================================
  // VIEW: TELA DE LOGIN DEDICADA
  // ==========================================
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#1E242B] font-sans antialiased flex flex-col justify-between selection:bg-[#4A6B5D] selection:text-white">
        {/* Top Header with Back Button */}
        <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <button
            onClick={() => {
              setCurrentView('home');
              window.location.hash = '';
            }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#4A6B5D] hover:text-[#3d594d] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#EBF1EE]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao início</span>
          </button>

          <LeiteFlowLogo size="sm" />
        </header>

        {/* Center Login Card */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-7 sm:p-10 shadow-xl border border-[#EFECE6] relative animate-fadeIn">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <LeiteFlowLogo size="lg" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E242B]">
                Acesse sua Conta
              </h1>
              <p className="text-xs text-[#8C8275] mt-1.5">
                Digite suas credenciais de acesso ao sistema LeiteFlow
              </p>
            </div>

            {loginErr && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{loginErr}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E242B] mb-1.5">
                  CPF ou E-mail
                </label>
                <input
                  type="text"
                  required
                  placeholder="000.000.000-00 ou seu e-mail"
                  value={loginForm.identifier}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLoginForm({
                      ...loginForm,
                      identifier: /^\d/.test(val) ? formatCPF(val) : val,
                    });
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-[#EFECE6] bg-[#FAF9F6] text-sm focus:outline-none focus:border-[#4A6B5D] transition-colors"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-[#1E242B]">
                    Senha de Acesso
                  </label>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[#EFECE6] bg-[#FAF9F6] text-sm focus:outline-none focus:border-[#4A6B5D] transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#4A6B5D] text-white font-semibold text-sm hover:bg-[#3d594d] transition-all shadow-md shadow-[#4A6B5D]/25 flex items-center justify-center gap-2 mt-2"
              >
                <span>Entrar no Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Credentials & Quero Doar option */}
            <div className="mt-6 pt-5 border-t border-[#EFECE6] text-center space-y-3">
              <button
                type="button"
                onClick={handleFillDemoLogin}
                className="text-xs text-[#4A6B5D] hover:underline font-medium inline-flex items-center gap-1.5 bg-[#EBF1EE] px-3.5 py-1.5 rounded-full"
              >
                <span>💡 Preencher dados de teste (Mariana)</span>
              </button>

              <div className="text-xs text-[#8C8275]">
                Ainda não doa leite em Marília?{' '}
                <button
                  onClick={() => {
                    setCurrentView('home');
                    setDonorErr('');
                    setActiveModal('quero-doar');
                  }}
                  className="font-semibold text-[#4A6B5D] underline"
                >
                  Quero Doar
                </button>
              </div>

              <p className="text-[11px] text-[#8C8275]">
                Banco de Leite Humano de Marília • HCFAMEMA
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 text-center text-xs text-[#8C8275]">
          © {new Date().getFullYear()} LeiteFlow Marília-SP. Todos os direitos reservados.
        </footer>
      </div>
    );
  }

  // ==========================================
  // VIEW: SISTEMA EM DESENVOLVIMENTO (DASHBOARD)
  // ==========================================
  if (currentView === 'dashboard' && userSession) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#1E242B] font-sans antialiased flex flex-col justify-between selection:bg-[#4A6B5D] selection:text-white">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#EFECE6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LeiteFlowLogo size="sm" />
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider border border-amber-300/40">
                Módulo em Desenvolvimento
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 bg-[#FAF9F6] px-3.5 py-1.5 rounded-full border border-[#EFECE6]">
                <div className="w-7 h-7 rounded-full bg-[#4A6B5D] text-white flex items-center justify-center font-bold text-xs">
                  {userSession.nome.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="block text-xs font-semibold text-[#1E242B]">
                    {userSession.nome}
                  </span>
                  <span className="block text-[10px] text-[#8C8275]">
                    {userSession.zonaMarilia}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-red-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-8">
          {/* Construction Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFECE6] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-amber-50 rounded-full blur-3xl pointer-events-none -z-0"></div>

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 flex-shrink-0">
                <Construction className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
                  <Hammer className="w-3.5 h-3.5" />
                  <span>Ambiente em Construção</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E242B]">
                  Olá, {userSession.nome.split(' ')[0]}! O sistema está sendo preparado.
                </h2>
                <p className="text-sm text-[#8C8275] max-w-2xl">
                  Seu cadastro foi vinculado com sucesso. Esta área do sistema interno do <strong>Banco de Leite Humano de Marília</strong> está em fase ativa de desenvolvimento e em breve contará com agendamentos automatizados, rastreamento de kits e relatórios.
                </p>
              </div>
            </div>
          </div>

          {/* User Session Info Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-sm">
              <span className="text-[11px] uppercase tracking-wider text-[#8C8275] block mb-1">
                Protocolo BLH
              </span>
              <span className="font-mono font-bold text-[#1E242B] text-sm">
                {userSession.protocolo}
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-sm">
              <span className="text-[11px] uppercase tracking-wider text-[#8C8275] block mb-1">
                Identificação
              </span>
              <span className="font-mono font-medium text-[#1E242B] text-sm">
                {userSession.cpf}
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-sm">
              <span className="text-[11px] uppercase tracking-wider text-[#8C8275] block mb-1">
                Região / Cidade
              </span>
              <span className="font-semibold text-[#4A6B5D] text-sm">
                Marília - {userSession.zonaMarilia}
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-sm">
              <span className="text-[11px] uppercase tracking-wider text-[#8C8275] block mb-1">
                Contato Registrado
              </span>
              <span className="font-mono text-sm text-[#1E242B]">
                {userSession.telefone}
              </span>
            </div>
          </div>

          {/* Modules in Development Roadmap */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-[#1E242B] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#4A6B5D]" />
                <span>Módulos do Sistema em Desenvolvimento</span>
              </h3>
              <span className="text-xs text-[#8C8275]">Previsão BLH 2026</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#EFECE6] shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#4A6B5D] flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-[#1E242B]">
                      Agendamento & Rotas de Coleta
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      70% Pronto
                    </span>
                  </div>
                  <p className="text-xs text-[#8C8275]">
                    Gestão automatizada dos dias de coleta domiciliar por bairro em Marília.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EFECE6] shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-[#1E242B]">
                      Pasteurização & Análise Laboratorial
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                      Em Breve
                    </span>
                  </div>
                  <p className="text-xs text-[#8C8275]">
                    Rastreamento de acidez Dornic, calorimetria e aprovação microbiológica.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EFECE6] shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <BellRing className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-[#1E242B]">
                      Notificações WhatsApp BLH
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                      Em Breve
                    </span>
                  </div>
                  <p className="text-xs text-[#8C8275]">
                    Avisos no celular quando o motorista do HCFAMEMA estiver a caminho da sua casa.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EFECE6] shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-[#1E242B]">
                      Impacto Nutricional na UTI Neonatal
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Em Breve
                    </span>
                  </div>
                  <p className="text-xs text-[#8C8275]">
                    Painel demonstrando quantos bebês prematuros foram beneficiados pelo leite doado.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#EFECE6]">
            <button
              onClick={() => setCurrentView('home')}
              className="text-xs text-[#4A6B5D] hover:underline font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ver página institucional do LeiteFlow</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-6 py-2.5 rounded-xl bg-[#4A6B5D] text-white font-semibold text-xs hover:bg-[#3d594d] transition-all shadow-sm"
            >
              Encerrar Sessão
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 border-t border-[#EFECE6] bg-white text-center text-xs text-[#8C8275]">
          Banco de Leite Humano de Marília • HCFAMEMA | Sistema LeiteFlow v1.0
        </footer>
      </div>
    );
  }

  // ==========================================
  // VIEW: LANDING PAGE PRINCIPAL ('home')
  // ==========================================
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1E242B] font-sans antialiased selection:bg-[#4A6B5D] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm animate-fadeIn">
          <div
            className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 text-sm font-medium ${
              toastMessage.type === 'admin'
                ? 'bg-[#1E242B] text-white border-amber-500/40'
                : 'bg-emerald-900 text-white border-emerald-400/30'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage.msg}</span>
          </div>
        </div>
      )}

      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#EFECE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          <a href="#" onClick={() => setCurrentView('home')}>
            <LeiteFlowLogo size="md" />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-[#1E242B]/80">
            <a href="#como-funciona" className="hover:text-[#4A6B5D] transition-colors">
              Como Funciona
            </a>
            <a href="#coleta-marilia" className="hover:text-[#4A6B5D] transition-colors">
              Coleta em Marília
            </a>
            <a href="#requisitos" className="hover:text-[#4A6B5D] transition-colors">
              Quem Pode Doar
            </a>
            <a href="#calculadora" className="hover:text-[#4A6B5D] transition-colors">
              Impacto
            </a>
            <a href="#duvidas" className="hover:text-[#4A6B5D] transition-colors">
              Dúvidas
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
            {userSession ? (
              <button
                onClick={() => setCurrentView('dashboard')}
                className="px-5 py-2.5 rounded-full bg-[#EBF1EE] text-[#4A6B5D] font-semibold text-sm hover:bg-[#4A6B5D] hover:text-white transition-all flex items-center gap-2 border border-[#4A6B5D]/20 shadow-sm"
              >
                <User className="w-4 h-4" />
                <span>Painel do Sistema</span>
              </button>
            ) : adminSession ? (
              <button
                onClick={() => setActiveModal('admin-dashboard')}
                className="px-5 py-2.5 rounded-full bg-[#1E242B] text-amber-300 font-semibold text-sm hover:bg-black transition-all flex items-center gap-2 border border-amber-500/30"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Painel Admin</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setLoginErr('');
                    setCurrentView('login');
                  }}
                  className="px-4 py-2 text-sm font-semibold text-[#1E242B] hover:text-[#4A6B5D] transition-colors"
                >
                  Entrar
                </button>

                <button
                  onClick={() => {
                    setDonorErr('');
                    setActiveModal('quero-doar');
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#4A6B5D] text-white font-semibold text-sm hover:bg-[#3d594d] transition-all shadow-md shadow-[#4A6B5D]/20 flex items-center gap-2 transform hover:-translate-y-0.5"
                >
                  <Heart className="w-4 h-4 fill-white/20" />
                  <span>Quero Doar</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex sm:hidden items-center gap-2">
            {userSession ? (
              <button
                onClick={() => setCurrentView('dashboard')}
                className="p-2 rounded-full bg-[#EBF1EE] text-[#4A6B5D]"
              >
                <User className="w-5 h-5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setDonorErr('');
                    setActiveModal('quero-doar');
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#4A6B5D] text-white font-semibold text-xs flex items-center gap-1 shadow-md"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>Doar</span>
                </button>

                <button
                  onClick={() => {
                    setLoginErr('');
                    setCurrentView('login');
                  }}
                  className="p-2 rounded-full hover:bg-[#EFECE6] text-[#1E242B]"
                >
                  <User className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="p-2 rounded-xl hover:bg-[#EFECE6] text-[#1E242B] transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white border-t border-[#EFECE6] shadow-lg animate-fadeIn">
            <nav className="flex flex-col px-4 py-3 gap-1">
              {[
                ['#como-funciona', 'Como Funciona'],
                ['#coleta-marilia', 'Coleta em Marília'],
                ['#requisitos', 'Quem Pode Doar'],
                ['#calculadora', 'Impacto'],
                ['#duvidas', 'Dúvidas'],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 px-2 text-sm font-medium text-[#1E242B] hover:text-[#4A6B5D] border-b border-[#EFECE6] last:border-0 transition-colors"
                >
                  {label}
                </a>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setDonorErr('');
                    setActiveModal('quero-doar');
                  }}
                  className="w-full py-3 rounded-xl bg-[#4A6B5D] text-white font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Quero Doar</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCurrentView('login');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#FAF9F6] text-[#1E242B] font-semibold text-sm border border-[#EFECE6]"
                >
                  Fazer Login no Sistema
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ========== HERO SECTION (COM O BOTÃO QUERO DOAR DA FOTO) ========== */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28 border-b border-[#EFECE6]">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-[#EBF1EE] rounded-full blur-3xl opacity-60 pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-56 sm:w-80 h-56 sm:h-80 bg-[#EFECE6] rounded-full blur-3xl opacity-70 pointer-events-none -z-10 -translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 flex flex-col items-start space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF1EE] text-[#4A6B5D] text-xs font-semibold tracking-wide uppercase border border-[#4A6B5D]/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Coleta Gratuita em Domicílio em Marília-SP</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.15] text-[#1E242B] tracking-tight">
                Seu excedente de leite é o{' '}
                <span className="italic font-light underline decoration-[#D4A373] decoration-2 underline-offset-4">
                  recomeço
                </span>{' '}
                de uma vida recém-nascida.
              </h1>

              <p className="text-base sm:text-lg text-[#1E242B]/75 leading-relaxed max-w-2xl">
                O <strong>Banco de Leite Humano de Marília</strong> (HCFAMEMA) busca o leite materno doado diretamente na sua casa em frascos esterilizados, sem nenhum custo. Cada gota transforma o futuro dos bebês prematuros na UTI Neonatal.
              </p>

              {/* ACTION BUTTONS: HERO BUTTON QUERO DOAR RESTAURADO IGUAL ANTES */}
              <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                {userSession ? (
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="px-8 py-4 rounded-full bg-[#4A6B5D] text-white font-medium text-base hover:bg-[#3d594d] transition-all shadow-lg shadow-[#4A6B5D]/25 flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
                  >
                    <User className="w-5 h-5" />
                    <span>Acessar Meu Painel</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setDonorErr('');
                      setActiveModal('quero-doar');
                    }}
                    className="px-8 py-4 rounded-full bg-[#4A6B5D] text-white font-medium text-base hover:bg-[#3d594d] transition-all shadow-lg shadow-[#4A6B5D]/25 flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
                  >
                    <Heart className="w-5 h-5 fill-white" />
                    <span>Quero Doar</span>
                  </button>
                )}

                <a
                  href="#como-funciona"
                  className="px-6 py-4 rounded-full bg-[#EFECE6] text-[#1E242B] font-medium text-base hover:bg-[#e4ded6] transition-all flex items-center justify-center gap-2 border border-[#8C8275]/20"
                >
                  <span>Entenda o Passo a Passo</span>
                  <ChevronRight className="w-4 h-4 text-[#8C8275]" />
                </a>
              </div>

              <div className="pt-4 border-t border-[#EFECE6] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#8C8275]">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#4A6B5D] flex-shrink-0" />
                  <span>
                    <strong>Unidade Marília:</strong> Rua XV de Novembro, 50 - Centro
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#4A6B5D] flex-shrink-0" />
                  <span>
                    <strong>BLH:</strong> (14) 3413-8696 / HCFAMEMA
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Card */}
            <div className="lg:col-span-5">
              <div className="relative bg-[#EFECE6] rounded-3xl p-5 sm:p-8 border border-[#8C8275]/20 shadow-xl overflow-hidden">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#4A6B5D]/10 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex flex-col items-center text-center p-5 sm:p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#FAF9F6] shadow-sm">
                  <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-[#EBF1EE] p-3 flex items-center justify-center shadow-inner mb-4">
                    <Droplet className="w-10 sm:w-12 h-10 sm:h-12 text-[#4A6B5D] fill-[#4A6B5D]/20 animate-pulse" />
                  </div>
                  <span className="font-serif text-xl sm:text-2xl font-semibold text-[#1E242B]">
                    1 Litro de Leite Materno
                  </span>
                  <p className="text-xs text-[#8C8275] uppercase tracking-widest mt-1">
                    Pode alimentar até
                  </p>
                  <div className="my-2">
                    <span className="font-serif text-4xl sm:text-5xl font-bold text-[#4A6B5D]">
                      10 Bebês
                    </span>
                  </div>
                  <p className="text-xs text-[#1E242B]/80 max-w-xs">
                    Prematuros na UTI Neonatal do HCFAMEMA por até 24 horas.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-white/60 p-3.5 rounded-xl border border-white/80 text-center">
                    <span className="block text-xl font-bold text-[#1E242B]">100%</span>
                    <span className="text-[11px] text-[#8C8275]">Gratuito em Casa</span>
                  </div>
                  <div className="bg-white/60 p-3.5 rounded-xl border border-white/80 text-center">
                    <span className="block text-xl font-bold text-[#4A6B5D]">5 Zonas</span>
                    <span className="text-[11px] text-[#8C8275]">Atendidas em Marília</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#8C8275]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-[#8C8275]">
                  <span>Supervisão Médica BLH</span>
                  <span className="font-semibold text-[#1E242B]">
                    Dra. Cleyde Moerbeck Casadei
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CALCULATOR SECTION ========== */}
      <section id="calculadora" className="py-12 sm:py-16 bg-white border-b border-[#EFECE6]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#4A6B5D]">
              Simulador de Doação
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-normal text-[#1E242B] mt-1">
              Calcule o impacto do seu amor em frascos
            </h2>
            <p className="text-sm text-[#8C8275] mt-2">
              Bebês prematuros iniciam com apenas 1 ml a 5 ml por mamada. Veja como poucos mililitros fazem toda a diferença!
            </p>
          </div>

          <div className="bg-[#FAF9F6] p-5 sm:p-10 rounded-3xl border border-[#EFECE6] shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
              <div className="md:col-span-7 space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-[#1E242B]">
                      Seu excedente diário estimado:
                    </label>
                    <span className="px-3 py-1 rounded-full bg-[#EBF1EE] text-[#4A6B5D] font-bold text-sm border border-[#4A6B5D]/20">
                      {mlPerDay} ml / dia
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="500"
                    step="10"
                    value={mlPerDay}
                    onChange={(e) => setMlPerDay(Number(e.target.value))}
                    className="w-full h-2.5 bg-[#EFECE6] rounded-lg appearance-none cursor-pointer accent-[#4A6B5D]"
                  />
                  <div className="flex justify-between text-[11px] text-[#8C8275] mt-1">
                    <span>30 ml</span>
                    <span>250 ml</span>
                    <span>500 ml</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#EFECE6] text-xs text-[#1E242B]/80 leading-relaxed flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#4A6B5D] flex-shrink-0 mt-0.5" />
                  <span>
                    A equipe do BLH Marília entrega os frascos de vidro esterilizados com tampa plástica na sua residência sem custo.
                  </span>
                </div>
              </div>

              <div className="md:col-span-5 bg-[#EFECE6] p-5 sm:p-6 rounded-2xl border border-[#8C8275]/20 text-center space-y-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#8C8275]">
                    Em 1 semana você doa
                  </span>
                  <div className="font-serif text-3xl font-bold text-[#1E242B] mt-0.5">
                    {(mlPerDay * 7).toLocaleString('pt-BR')} ml
                  </div>
                </div>
                <div className="w-full h-px bg-[#8C8275]/20"></div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#8C8275]">
                    Alimenta aproximadamente
                  </span>
                  <div className="font-serif text-4xl font-bold text-[#4A6B5D] my-1">
                    {Math.max(1, Math.floor((mlPerDay * 7) / 70))}{' '}
                    <span className="text-lg font-sans font-normal text-[#1E242B]">
                      bebês/semana
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8C8275]">(Dieta inicial prematura)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="como-funciona" className="py-14 sm:py-20 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#4A6B5D]">
              Jornada Simplificada
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-normal text-[#1E242B] mt-1">
              Como funciona a doação sem sair de casa
            </h2>
            <p className="text-sm sm:text-base text-[#8C8275] mt-3">
              Você cuida do seu filho com carinho e o LeiteFlow cuida da logística de coleta em Marília.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {[
              {
                num: '01',
                icon: User,
                title: 'Atendimento & Triagem',
                desc: 'Nossa equipe de enfermagem do HCFAMEMA valida seu histórico e exames de pré-natal por telefone ou presencialmente.',
              },
              {
                num: '02',
                icon: Heart,
                title: 'Kits Estéreis',
                desc: 'Receba em sua residência os frascos de vidro esterilizados com tampa plástica, touca e máscara sem nenhum custo.',
              },
              {
                num: '03',
                icon: Droplet,
                title: 'Retirada e Congelamento',
                desc: 'Extraia o excesso de leite e mantenha no congelador. Uma vez por semana nossa equipe faz a coleta na sua porta.',
              },
              {
                num: '04',
                icon: Truck,
                title: 'Pasteurização & UTI',
                desc: 'No BLH HCFAMEMA, o leite passa por rigorosos exames microbiológicos e pasteurização antes de ir aos bebês.',
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EFECE6] shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-serif text-3xl font-bold text-[#4A6B5D]/30 group-hover:text-[#4A6B5D] transition-colors">
                    {step.num}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-[#EBF1EE] flex items-center justify-center text-[#4A6B5D]">
                    <step.icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#1E242B] mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-[#8C8275] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== MARILIA ZONES ========== */}
      <section id="coleta-marilia" className="py-12 sm:py-16 bg-[#EFECE6] border-y border-[#8C8275]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#4A6B5D]">
                Logística de Coleta
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1E242B]">
                Atendimento em todos os bairros de Marília-SP
              </h2>
              <p className="text-sm text-[#1E242B]/80 leading-relaxed">
                Nossa equipe percorre diariamente as diferentes rotas urbanas do município de Marília para recolher os frascos congelados na porta de sua casa.
              </p>
              <div className="p-4 rounded-2xl bg-white/70 border border-white text-xs text-[#1E242B] space-y-2">
                <div className="font-semibold text-[#4A6B5D] flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Sede: BLH HCFAMEMA</span>
                </div>
                <p className="text-[#8C8275]">Rua XV de Novembro, 50 - Centro, Marília - SP</p>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  zona: 'Zona Norte',
                  bairros: 'JK, Aeroporto, Soft, Palmital, Castelo Branco',
                  dia: 'Terças-feiras (Manhã)',
                },
                {
                  zona: 'Zona Sul',
                  bairros: 'Nova Marília, CDHU, Costa e Silva, Esmeralda',
                  dia: 'Quartas-feiras (Manhã)',
                },
                {
                  zona: 'Zona Leste',
                  bairros: 'Cascata, Fragata, Maria Izabel, Tangará',
                  dia: 'Quintas-feiras (Manhã)',
                },
                {
                  zona: 'Zona Oeste & Centro',
                  bairros: 'Alto Cafezal, Jardim Cavalari, Banzato, Centro',
                  dia: 'Sextas-feiras (Manhã)',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-white shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-[#1E242B]">
                        {item.zona}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EBF1EE] text-[#4A6B5D]">
                        Rota Ativa
                      </span>
                    </div>
                    <p className="text-xs text-[#8C8275] mb-3">{item.bairros}</p>
                  </div>
                  <div className="pt-2 border-t border-[#EFECE6] flex items-center gap-1.5 text-[11px] font-medium text-[#4A6B5D]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.dia}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== REQUIREMENTS ========== */}
      <section id="requisitos" className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#4A6B5D]">
              Critérios de Saúde
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-normal text-[#1E242B] mt-1">
              Quem pode ser uma doadora LeiteFlow?
            </h2>
            <p className="text-sm text-[#8C8275] mt-2">
              A doação é segura para você e seu bebê. Confira os requisitos da ANVISA/Ministério da Saúde.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: CheckCircle2,
                title: 'Amamentação Saudável',
                desc: 'Estar amamentando o próprio filho com boa produção e apresentar excedente de leite materno de forma confortável.',
              },
              {
                icon: ShieldCheck,
                title: 'Hábitos Saudáveis',
                desc: 'NÃO fazer uso de medicamentos incompatíveis, não consumir bebidas alcoólicas e não ser fumante.',
              },
              {
                icon: FileText,
                title: 'Exames Pré-natal',
                desc: 'Apresentar cartão de gestante ou exames recentes (HIV, Sífilis, Hepatite B/C) do pré-natal ou pós-parto.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-[#FAF9F6] p-6 sm:p-7 rounded-3xl border border-[#EFECE6]">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#4A6B5D] flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#1E242B] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-[#8C8275] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section id="duvidas" className="py-14 sm:py-20 bg-[#FAF9F6] border-t border-[#EFECE6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#4A6B5D]">
              Esclarecimentos
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1E242B] mt-1">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {[
              {
                q: 'Doar leite vai fazer faltar leite para o meu próprio bebê?',
                a: 'Não! Quanto mais a mama é estimulada e esvaziada, mais leite o seu corpo produz. A doação retira apenas o volume excedente que seu bebê não mamou.',
              },
              {
                q: 'Preciso pagar pelos frascos de vidro?',
                a: 'Não. O Banco de Leite Humano de Marília fornece gratuitamente todos os frascos de vidro com tampa de plástico esterilizados.',
              },
              {
                q: 'Por quanto tempo posso guardar o leite no congelador antes da coleta?',
                a: 'O leite materno cru pode ficar congelado por até 15 dias. Recomendamos agendar a coleta semanalmente.',
              },
              {
                q: 'Como é feita a higienização antes de tirar o leite?',
                a: 'Basta lavar as mãos até os cotovelos com água e sabão neutro e secar em toalha limpa. Nas mamas, use apenas água. Disponibilizamos um guia impresso junto aos frascos.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-[#EFECE6] overflow-hidden">
                <button
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex justify-between items-center gap-4 hover:bg-[#FAF9F6] transition-colors"
                >
                  <span className="font-serif font-medium text-sm sm:text-base text-[#1E242B]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#8C8275] flex-shrink-0 transition-transform ${
                      faqOpen === idx ? 'rotate-180 text-[#4A6B5D]' : ''
                    }`}
                  />
                </button>
                {faqOpen === idx && (
                  <div className="px-5 sm:px-6 pb-4 sm:pb-5 text-sm text-[#8C8275] leading-relaxed border-t border-[#EFECE6] pt-3 sm:pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-[#1E242B] text-white pt-12 sm:pt-16 pb-10 sm:pb-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 pb-10 border-b border-stone-800">
            <div className="md:col-span-5 space-y-4">
              <LeiteFlowLogo variant="dark" size="md" />
              <p className="text-xs text-stone-400 leading-relaxed max-w-sm mt-3">
                Plataforma oficial do Banco de Leite Humano de Marília (HCFAMEMA). Promovendo saúde e nutrição de recém-nascidos prematuros na UTI Neonatal.
              </p>
            </div>

            <div className="md:col-span-4 space-y-3">
              <h4 className="font-serif text-sm font-semibold text-[#D4A373]">
                Banco de Leite Humano de Marília
              </h4>
              <ul className="space-y-2 text-xs text-stone-300">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#4A6B5D] flex-shrink-0 mt-0.5" />
                  <span>Rua XV de Novembro, 50 - Centro, Marília - SP</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#4A6B5D]" />
                  <span>(14) 3413-8696</span>
                </li>
                <li className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-[#4A6B5D] flex-shrink-0 mt-0.5" />
                  <span>Vinculado ao HCFAMEMA / Dra. Cleyde M. Casadei</span>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-3">
              <h4 className="font-serif text-sm font-semibold text-[#D4A373]">
                Acesso ao Sistema
              </h4>
              <div className="flex flex-col space-y-2 text-xs text-stone-300">
                <button
                  onClick={() => {
                    setDonorErr('');
                    setActiveModal('quero-doar');
                  }}
                  className="text-left hover:text-emerald-400 transition-colors"
                >
                  Quero Doar
                </button>
                <button
                  onClick={() => {
                    setLoginErr('');
                    setCurrentView(userSession ? 'dashboard' : 'login');
                  }}
                  className="text-left hover:text-emerald-400 transition-colors"
                >
                  {userSession ? 'Meu Painel' : 'Login'}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <span>
              &copy; {new Date().getFullYear()} LeiteFlow Marília-SP. Todos os direitos reservados.
            </span>

            <button
              onClick={() => {
                setAdminErr('');
                setAdminForm({ matricula: '', chaveSeguranca: '', senha: '' });
                setActiveModal('admin-login');
              }}
              className="group flex items-center gap-1.5 px-3 py-1 rounded-md bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-300 hover:border-amber-500/40 transition-all text-[11px]"
              title="Acesso Restrito BLH"
            >
              <Lock className="w-3 h-3 text-stone-500 group-hover:text-amber-400" />
              <span>Acesso Restrito BLH</span>
            </button>
          </div>
        </div>
      </footer>

      {/* ========== MODAL: QUERO DOAR (ENVIA PARA O SISTEMA) ========== */}
      {activeModal === 'quero-doar' && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}
        >
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#EFECE6] relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#FAF9F6] text-[#8C8275]"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="sm:hidden w-10 h-1 bg-[#EFECE6] rounded-full mx-auto mb-5"></div>

            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-full bg-[#EBF1EE] text-[#4A6B5D] mb-3">
                <Heart className="w-6 h-6 fill-[#4A6B5D]/20 text-[#4A6B5D]" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-[#1E242B]">
                Quero Doar Leite Materno
              </h3>
              <p className="text-xs text-[#8C8275] mt-1">
                Cadastre-se para receber a visita da equipe do BLH em sua casa em Marília-SP
              </p>
            </div>

            {donorErr && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{donorErr}</span>
              </div>
            )}

            <form onSubmit={handleDonorSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E242B] mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Maria Oliveira Santos"
                  value={donorForm.nome}
                  onChange={(e) => setDonorForm({ ...donorForm, nome: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#EFECE6] bg-[#FAF9F6] text-sm focus:outline-none focus:border-[#4A6B5D] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E242B] mb-1">
                  WhatsApp / Celular com DDD *
                </label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  placeholder="(14) 99999-9999"
                  value={donorForm.telefone}
                  onChange={(e) =>
                    setDonorForm({ ...donorForm, telefone: formatPhone(e.target.value) })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[#EFECE6] bg-[#FAF9F6] text-sm focus:outline-none focus:border-[#4A6B5D] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E242B] mb-1">
                    Região em Marília *
                  </label>
                  <select
                    value={donorForm.zonaMarilia}
                    onChange={(e) =>
                      setDonorForm({ ...donorForm, zonaMarilia: e.target.value })
                    }
                    className="w-full px-3 py-3 rounded-xl border border-[#EFECE6] bg-[#FAF9F6] text-sm focus:outline-none focus:border-[#4A6B5D]"
                  >
                    <option value="Zona Sul">Zona Sul</option>
                    <option value="Zona Norte">Zona Norte</option>
                    <option value="Zona Leste">Zona Leste</option>
                    <option value="Zona Oeste">Zona Oeste</option>
                    <option value="Centro">Centro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E242B] mb-1">
                    Bairro em Marília *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Jardim Esmeralda"
                    value={donorForm.bairro}
                    onChange={(e) =>
                      setDonorForm({ ...donorForm, bairro: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-[#EFECE6] bg-[#FAF9F6] text-sm focus:outline-none focus:border-[#4A6B5D] transition-colors"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EBF1EE] text-xs text-[#4A6B5D] leading-relaxed flex items-start gap-2.5">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  O Banco de Leite de Marília (HCFAMEMA) fornece os frascos esterilizados gratuitamente e agenda a coleta no melhor horário para você.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#4A6B5D] text-white font-semibold text-sm hover:bg-[#3d594d] transition-all shadow-md shadow-[#4A6B5D]/25 flex items-center justify-center gap-2 mt-2"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Enviar para o Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-[#EFECE6] text-center text-xs text-[#8C8275]">
              Já possui cadastro no sistema?{' '}
              <button
                onClick={() => {
                  setActiveModal(null);
                  setCurrentView('login');
                }}
                className="font-semibold text-[#4A6B5D] underline"
              >
                Fazer Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL: ADMIN LOGIN ========== */}
      {activeModal === 'admin-login' && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}
        >
          <div className="bg-[#1E242B] text-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-700 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-800 text-stone-400"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="sm:hidden w-10 h-1 bg-stone-700 rounded-full mx-auto mb-5"></div>

            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-400 mb-3 border border-amber-500/20">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block">
                Acesso Restrito & Protegido
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-white mt-1">
                Portal Administrativo BLH
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Exclusivo para Equipe Técnica de Marília
              </p>
            </div>

            {adminErr && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{adminErr}</span>
              </div>
            )}

            <form onSubmit={handleAdminLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Matrícula HC / E-mail Corporativo
                </label>
                <input
                  type="text"
                  required
                  placeholder="admin@hc.famema.br ou matrícula"
                  value={adminForm.matricula}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, matricula: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-700 bg-stone-900/90 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Chave de Segurança / Token
                </label>
                <input
                  type="text"
                  required
                  placeholder="BLH-2026-MARILIA"
                  value={adminForm.chaveSeguranca}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, chaveSeguranca: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-700 bg-stone-900/90 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Senha Institucional
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminForm.senha}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, senha: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-700 bg-stone-900/90 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/10 mt-2"
              >
                Autenticar Sessão Segura
              </button>
            </form>

            <div className="mt-5 p-3 rounded-xl bg-stone-900 border border-stone-800 text-[11px] text-stone-400">
              <span className="font-semibold text-amber-400 block mb-1">
                💡 Credenciais para Avaliação:
              </span>
              <p>
                <strong>E-mail:</strong> admin@hc.famema.br | <strong>Token:</strong>{' '}
                BLH-2026-MARILIA | <strong>Senha:</strong> admin
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL: ADMIN DASHBOARD ========== */}
      {activeModal === 'admin-dashboard' && adminSession && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}
        >
          <div className="bg-[#1E242B] text-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-amber-500/30 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-800 text-stone-400"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="sm:hidden w-10 h-1 bg-stone-700 rounded-full mx-auto mb-5"></div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 flex-shrink-0">
                <KeyRound className="w-6 sm:w-7 h-6 sm:h-7" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block">
                  Autenticação Confirmada
                </span>
                <h3 className="font-serif text-lg sm:text-2xl font-semibold text-white">
                  {adminSession.nome}
                </h3>
                <span className="text-xs text-stone-400">{adminSession.cargo}</span>
              </div>
            </div>

            <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 space-y-1.5 mb-6 text-xs text-stone-300">
              {[
                ['Matrícula', adminSession.matricula, 'font-mono text-amber-300'],
                ['Nível de Permissão', adminSession.nivelAcesso, 'font-semibold text-emerald-400'],
                ['Início da Sessão', adminSession.dataHora, 'font-mono'],
              ].map(([label, value, cls]) => (
                <div
                  key={label}
                  className="flex justify-between py-1.5 border-b border-stone-800 last:border-0"
                >
                  <span className="text-stone-500">{label}:</span>
                  <span className={cls}>{value}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-800">
              <button
                onClick={() => {
                  setAdminSession(null);
                  setActiveModal(null);
                  showToast('Sessão administrativa encerrada.');
                }}
                className="text-xs text-red-400 font-semibold flex items-center gap-1 hover:underline"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Encerrar Sessão</span>
              </button>
              <button
                onClick={() => showToast('Redirecionando para o sistema de gestão...')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
              >
                <span>Painel de Gestão</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
