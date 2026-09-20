export const locales=[
  {code:"id",name:"Bahasa Indonesia",flag:"🇮🇩"},
  {code:"en",name:"English",flag:"🇬🇧"},
  {code:"ms",name:"Bahasa Melayu",flag:"🇲🇾"},
  {code:"zh",name:"简体中文",flag:"🇨🇳"},
  {code:"ja",name:"日本語",flag:"🇯🇵"},
  {code:"ko",name:"한국어",flag:"🇰🇷"},
  {code:"ar",name:"العربية",flag:"🇸🇦"},
  {code:"es",name:"Español",flag:"🇪🇸"},
  {code:"fr",name:"Français",flag:"🇫🇷"},
  {code:"de",name:"Deutsch",flag:"🇩🇪"}
] as const;
export type Locale=typeof locales[number]["code"];
const en={home:"Home",divisions:"Divisions",recruitment:"Recruitment",events:"Events",fleet:"Fleet",projects:"Projects",news:"News",about:"About",settings:"Settings",login:"Login",register:"Register",logout:"Logout",dashboard:"Dashboard",join:"JOIN US",language:"Language",welcome:"Welcome",save:"Save"};
export const messages:Record<Locale,typeof en>={
id:{...en,home:"Beranda",divisions:"Divisi",recruitment:"Rekrutmen",events:"Event",fleet:"Armada",projects:"Proyek",news:"Berita",about:"Tentang",settings:"Pengaturan",login:"Masuk",register:"Daftar",logout:"Keluar",dashboard:"Dashboard",join:"GABUNG",language:"Bahasa",welcome:"Selamat datang",save:"Simpan"},
en,
ms:{...en,home:"Laman Utama",divisions:"Divisi",recruitment:"Pengambilan Ahli",events:"Acara",fleet:"Armada",projects:"Projek",news:"Berita",about:"Tentang",settings:"Tetapan",login:"Log Masuk",register:"Daftar",logout:"Log Keluar",dashboard:"Papan Pemuka",join:"SERTAI",language:"Bahasa",welcome:"Selamat datang",save:"Simpan"},
zh:{...en,home:"首页",divisions:"部门",recruitment:"招募",events:"活动",fleet:"车队",projects:"项目",news:"新闻",about:"关于",settings:"设置",login:"登录",register:"注册",logout:"退出",dashboard:"控制台",join:"加入我们",language:"语言",welcome:"欢迎",save:"保存"},
ja:{...en,home:"ホーム",divisions:"部門",recruitment:"募集",events:"イベント",fleet:"フリート",projects:"プロジェクト",news:"ニュース",about:"概要",settings:"設定",login:"ログイン",register:"登録",logout:"ログアウト",dashboard:"ダッシュボード",join:"参加する",language:"言語",welcome:"ようこそ",save:"保存"},
ko:{...en,home:"홈",divisions:"부서",recruitment:"모집",events:"이벤트",fleet:"차량",projects:"프로젝트",news:"뉴스",about:"소개",settings:"설정",login:"로그인",register:"회원가입",logout:"로그아웃",dashboard:"대시보드",join:"가입하기",language:"언어",welcome:"환영합니다",save:"저장"},
ar:{...en,home:"الرئيسية",divisions:"الأقسام",recruitment:"التوظيف",events:"الفعاليات",fleet:"الأسطول",projects:"المشاريع",news:"الأخبار",about:"حول",settings:"الإعدادات",login:"تسجيل الدخول",register:"تسجيل",logout:"تسجيل الخروج",dashboard:"لوحة التحكم",join:"انضم إلينا",language:"اللغة",welcome:"مرحبًا",save:"حفظ"},
es:{...en,home:"Inicio",divisions:"Divisiones",recruitment:"Reclutamiento",events:"Eventos",fleet:"Flota",projects:"Proyectos",news:"Noticias",about:"Nosotros",settings:"Ajustes",login:"Iniciar sesión",register:"Registrarse",logout:"Cerrar sesión",dashboard:"Panel",join:"ÚNETE",language:"Idioma",welcome:"Bienvenido",save:"Guardar"},
fr:{...en,home:"Accueil",divisions:"Divisions",recruitment:"Recrutement",events:"Événements",fleet:"Flotte",projects:"Projets",news:"Actualités",about:"À propos",settings:"Paramètres",login:"Connexion",register:"S’inscrire",logout:"Déconnexion",dashboard:"Tableau de bord",join:"REJOINDRE",language:"Langue",welcome:"Bienvenue",save:"Enregistrer"},
de:{...en,home:"Startseite",divisions:"Abteilungen",recruitment:"Bewerbung",events:"Veranstaltungen",fleet:"Flotte",projects:"Projekte",news:"Neuigkeiten",about:"Über uns",settings:"Einstellungen",login:"Anmelden",register:"Registrieren",logout:"Abmelden",dashboard:"Dashboard",join:"BEITRETEN",language:"Sprache",welcome:"Willkommen",save:"Speichern"}
};