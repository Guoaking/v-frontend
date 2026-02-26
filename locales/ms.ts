
import { Translation } from '../types';

export const ms: Translation = {
  common: {
    loading: 'Memuatkan...',
    success: 'Berjaya',
    error: 'Ralat',
    save: 'Simpan Perubahan',
    cancel: 'Batal',
    submit: 'Hantar',
    edit: 'Sunting',
    logout: 'Log Keluar',
    dashboard: 'Konsol',
    api_key: 'Kunci API',
    copy: 'Salin Hasil',
    copied: 'Disalin!',
    settings: 'Tetapan Sambungan',
    admin_portal: 'Portal Admin',
    active: 'Aktif',
    revoked: 'Dibatalkan',
    suspended: 'Digantung',
    pending: 'Belum Selesai',
    month: 'bulan',
    date: 'Tarikh',
    status: 'Status',
    actions: 'Tindakan'
  },
  nav: {
    home: 'Laman Utama',
    products: 'Produk',
    solutions: 'Penyelesaian',
    developers: 'Pembangun',
    pricing: 'Harga',
    about: 'Tentang',
    login: 'Log Masuk',
    register: 'Mula',
    profile: 'Akaun',
    contact: 'Hubungi Jualan'
  },
  auth: {
    login_title: 'Selamat Kembali',
    login_subtitle: 'Log masuk untuk mengakses konsol pembangun anda',
    register_title: 'Cipta Akaun',
    register_subtitle: 'Mulakan percubaan percuma anda dengan 1,000 panggilan API',
    email_placeholder: 'nama@syarikat.com',
    password_placeholder: 'Kata Laluan',
    name_placeholder: 'Nama Penuh',
    company_placeholder: 'Nama Syarikat',
    forgot_password: 'Lupa Kata Laluan?',
    dont_have_account: "Tiada akaun? Daftar",
    already_have_account: 'Sudah mempunyai akaun? Log masuk',
    social_login: 'Atau teruskan dengan',
    privacy_agreement: 'Dengan meneruskan, anda bersetuju dengan Terma dan Dasar Privasi kami.',
    login_as_admin: 'Log masuk sebagai Admin (Demo)',
    login_failed: 'E-mel atau kata laluan tidak sah',
    register_failed: 'Pendaftaran gagal. E-mel mungkin sudah digunakan.'
  },
  console: {
    overview: 'Gambaran Keseluruhan',
    credentials: 'Kredensial API',
    usage: 'Penggunaan & Had',
    logs: 'Log API',
    billing: 'Pebayaran',
    team: 'Ahli Pasukan',
    settings: 'Tetapan Akaun',
    integration: 'Integrasi',
    webhooks: 'Webhooks',
    create_key: 'Cipta Kunci Baru',
    revoke: 'Batalkan',
    total_requests: 'Jumlah Permintaan',
    error_rate: 'Kadar Ralat',
    recent_activity: 'Aktiviti Terkini',
    key_name_placeholder: 'Nama Kunci (cth. Pelayan Prod)',
    security: 'Keselamatan',
    profile: 'Profil',
    preferences: 'Keutamaan',
    change_password: 'Tukar Kata Laluan',
    mfa: 'Pengesahan Pelbagai Faktor',
    danger_zone: 'Zon Bahaya',
    delete_account: 'Padam Akaun',
    scopes: 'Skop API',
    select_scopes: 'Pilih kebenaran untuk kunci ini',
    ip_whitelist: 'Senarai Putih IP',
    ip_placeholder: 'cth. 192.168.1.0/24 (Pilihan)',
    active_keys: 'Kunci Aktif',
    key_name: 'Nama Kunci',
    token: 'Token',
    created: 'Dicipta',
  },
  profile: {
    title: 'Profil',
    pro_plan: 'Pelan Pro',
    no_company: 'Tiada Syarikat',
    key_desc: 'Gunakan kunci ini untuk mengesahkan permintaan API anda. Jangan kongsi kunci ini.',
    no_key: 'Tiada Kunci API Ditemui',
    security_overview: 'Gambaran Keselamatan',
    account_protected: 'Akaun Dilindungi',
    mfa_enabled: 'MFA diaktifkan melalui Google Auth',
    full_name: 'Nama Penuh',
    company: 'Syarikat',
    change_avatar: 'Tukar Avatar',
    avatar_help: 'JPG, GIF atau PNG. Saiz maks 800K'
  },
  settings: {
    current_password: 'Kata Laluan Semasa',
    new_password: 'Kata Laluan Baru',
    update_password: 'Kemaskini Kata Laluan',
    mfa_title: 'Pengesahan dua faktor',
    mfa_desc: 'Tambah lapisan keselamatan tambahan pada akaun anda.',
    danger_desc: 'Setelah anda memadamkan akaun anda, tiada jalan kembali. Sila pastikan.',
    dark_mode: 'Mod Gelap',
    dark_mode_desc: 'Tukar tema gelap untuk konsol.',
    switch_light: 'Tukar ke Terang',
    switch_dark: 'Tukar ke Gelap',
    language: 'Bahasa',
    language_desc: 'Pilih bahasa antara muka pilihan anda.'
  },
  billing: {
    current_plan: 'Pelan Semasa',
    upgrade: 'Naik Taraf Pelan',
    payment_method: 'Kaedah Pembayaran',
    invoices: 'Sejarah Invois',
    usage_limit: 'Had Penggunaan',
    next_invoice: 'Invois Seterusnya',
    plan: 'Pelan',
    cancel_sub: 'Batal Langganan',
    update_card: 'Kemaskini Kad',
    invoice_id: 'ID Invois',
    amount: 'Jumlah',
    download: 'Muat Turun',
    expires: 'Tamat Tempoh',
  },
  team: {
    invite_member: 'Jemput Ahli',
    role: 'Peranan',
    status: 'Status',
    actions: 'Tindakan',
    invite_placeholder: 'rakansekerja@syarikat.com',
    remove_member: 'Alih Keluar Ahli'
  },
  oauth: {
    title: 'Pelanggan OAuth',
    subtitle: 'Urus pelanggan OAuth 2.0 anda untuk integrasi pelayan-ke-pelayan yang selamat.',
    create_client: 'Daftar Pelanggan',
    client_name: 'Nama Pelanggan',
    client_id: 'ID Pelanggan',
    scopes: 'Skop',
    redirect_uri: 'URI Pengalihan',
    create_desc: 'Daftar aplikasi baru untuk mendapatkan Kredensial Pelanggan.',
    secret_warning: 'Rahsia pelanggan ini hanya akan dipaparkan sekali. Simpan dengan selamat.',
    description: 'Penerangan'
  },
  admin: {
    dashboard: 'Papan Pemuka',
    users: 'Pengurusan Pengguna',
    organizations: 'Organisasi',
    plans: 'Pengurusan Pelan',
    system: 'Kesihatan Sistem',
    audit: 'Log Audit',
    monitor: 'Monitor Sistem',
    total_users: 'Jumlah Pengguna',
    active_keys: 'Kunci API Aktif',
    system_health: 'Kesihatan Sistem',
    suspend: 'Gantung',
    activate: 'Aktifkan',
    user_management: 'Pengurusan Pengguna',
    org_management: 'Pengurusan Organisasi',
    search_placeholder: 'Cari pengguna atau organisasi...',
    live_traffic: 'Trafik Langsung (Tiruan)',
    system_logs: 'Log Sistem',
    columns: {
      user: 'Pengguna',
      role: 'Peranan',
      org: 'Organisasi',
      status: 'Status',
      plan: 'Pelan',
      members: 'Ahli',
      usage: 'Penggunaan',
      created: 'Dicipta',
      timestamp: 'Cap Waktu',
      target: 'Sasaran',
      action: 'Tindakan',
      ip: 'Alamat IP'
    },
    monitor_tabs: {
      overview: 'Gambaran Keseluruhan',
      business: 'Metrik Perniagaan',
      security: 'Keselamatan'
    }
  },
  hero: {
    title: 'AI E-KYC Terlokalisasi Mendalam untuk Asia Tenggara',
    subtitle: 'Kestabilan gred perusahaan dengan ketepatan 99.9%. Dioptimumkan untuk senario pengesahan Thailand & SEA.',
    cta_primary: 'Lihat Demo',
    cta_secondary: 'Lihat Dokumentasi',
  },
  home_stats: {
    yield_label: 'Hasil Lulus Pertama',
    cost_label: 'Pengurangan Kos',
    docs_label: 'Jenis Dokumen SEA'
  },
  features: {
    title: 'Keupayaan Teras',
    ocr_title: 'OCR Pintar',
    ocr_desc: 'Menyesuaikan diri dengan kualiti rendah, silau, dan susun atur kompleks. Khusus untuk skrip SEA.',
    liveness_title: 'Liveness Pasif',
    liveness_desc: 'Anti-spoofing gred perbankan. Pemeriksaan senyap + pengesanan gerakan mikro.',
    face_title: 'Pengecaman Wajah',
    face_desc: 'Dioptimumkan untuk ciri wajah Asia Tenggara dengan daya pemprosesan tinggi.',
  },
  products: {
    title: 'Modul Produk',
    subtitle: 'Keupayaan AI komprehensif tersedia melalui API & SDK',
    categories: {
      ocr: 'Modul OCR',
      liveness: 'Modul Liveness',
      face: 'Modul Pengecaman Wajah'
    },
    items: {
      custom_template_ocr: 'OCR Templat Tersuai',
      id_quality_check: 'Pemeriksaan Kualiti ID',
      id_card_ocr: 'Pengecaman Kad ID',
      driver_license_ocr: 'OCR Lesen Memandu',
      vehicle_license_ocr: 'OCR Lesen Kenderaan',
      bank_card_ocr: 'OCR Kad Bank',
      business_license_ocr: 'OCR Lesen Perniagaan',
      general_ocr: 'Pengecaman Teks Umum',
      liveness_silent: 'Liveness Senyap',
      liveness_video: 'Liveness Video',
      face_detection: 'Pengesanan Wajah',
      face_compare: 'Perbandingan Wajah (1:1)',
      face_search: 'Carian Wajah (1:N)',
    },
    buttons: {
      api_docs: 'Dokumentasi API',
      live_demo: 'Cuba Demo Langsung'
    },
    demo_labels: {
      ocr: 'Analisis Dokumen',
      liveness: 'Anti-Spoofing',
      face: 'Padanan Biometrik'
    }
  },
  solutions: {
    title: 'Dibina untuk Skala',
    subtitle: "Menyelesaikan cabaran pengesahan khusus di sektor-sektor yang paling pesat berkembang di Asia Tenggara.",
    industries: {
      banking: {
        title: "Perbankan & Kewangan",
        desc: "Mencegah penipuan identiti dan serangan ID sintetik. Mempercepatkan pembukaan akaun < 2 minit.",
        kpis: ["-78% Kos Audit", "+52% Penukaran"]
      },
      insurance: {
        title: "Insurans & Penjagaan Kesihatan",
        desc: "Onboarding digital untuk pemegang polisi. Sahkan pesakit dari jauh untuk teleperubatan.",
        kpis: ["100% Patuh", "Tanpa Geseran"]
      },
      government: {
        title: "Kerajaan & Awam",
        desc: "Akses selamat ke perkhidmatan rakyat. Mengendalikan beban puncak semasa pengagihan subsidi.",
        kpis: ["Sedia On-Prem", "Skala Nasional"]
      },
      commerce: {
        title: "Perdagangan Digital",
        desc: "Arkitektur kepercayaan untuk pasaran. Sahkan penjual dan pembeli bernilai tinggi.",
        kpis: ["Masa Nyata", "Anti-Penipuan"]
      },
      mobility: {
        title: "Mobiliti & Logistik",
        desc: "Pengesahan pemandu untuk e-hailing. OCR lesen segera untuk penyewaan.",
        kpis: ["Keselamatan Pemandu", "Daftar Masuk Pantas"]
      },
      telecom: {
        title: "Telekomunikasi",
        desc: "Pematuhan pendaftaran SIM (NBTC/Kominfo). Pengaktifan di kedai dan jauh.",
        kpis: ["RegTech", "Omnichannel"]
      },
    },
    case_study: {
      title: 'Kisah Kejayaan',
      subtitle: 'Bagaimana Platform HR Terkemuka Thailand mengurangkan masa onboarding sebanyak 90%',
      desc: "Dengan mengintegrasikan OCR ID dan pengesanan Liveness Verilocale, platform ini menghapuskan pemeriksaan dokumen manual untuk 50,000+ pekerja gig setiap bulan.",
      cta: 'Baca Kajian Kes'
    }
  },
  playground: {
    title: 'Meja Kerja Multi-Modal',
    subtitle: 'Uji model AI kami dengan keupayaan Imej, Video, dan Perbandingan.',
    select_capability: 'Pilih Keupayaan',
    upload_text: 'Lepaskan imej di sini atau klik untuk memuat naik',
    analyzing: 'Sedang Memproses...',
    results: 'Keputusan Analisis',
    json_view: 'JSON',
    raw_view: 'Mentah',
    config_title: 'Konfigurasi API',
    base_url: 'URL Asas',
    token: 'Token Bearer',
    run_analysis: 'Jalankan Analisis',
    select_key: 'Pilih Kunci API',
    no_keys: 'Tiada kunci aktif ditemui',
    create_key_prompt: 'Cipta kunci di Konsol',
    ocr_language: 'Bahasa Dokumen'
  },
  chat: {
    welcome: "Halo! Saya VeriBot. Bagaimana saya boleh membantu anda dengan API Verilocale hari ini?",
    placeholder: "Taip mesej...",
    history: "Sejarah Perbualan",
    new_chat: "Sembang Baru",
    no_history: "Tiada sejarah lagi",
    powered_by: "Dikuasakan oleh Gemini. AI mungkin melakukan kesilapan.",
    error_response: "Saya menghadapi masalah menyambung ke pangkalan pengetahuan sekarang. Sila cuba lagi kemudian."
  },
  footer: {
    rights: 'Hak cipta terpelihara.',
    partner: 'Perisian Rakan Kongsi oleh',
    desc: "Merekayasa kepercayaan untuk ekonomi digital Asia Tenggara. OCR dan Pengesahan Identiti gred perusahaan.",
    legal_header: 'Undang-undang & Pematuhan',
    links: {
      api_ref: 'Rujukan API',
      contact: 'Hubungi Kami'
    },
    legal: {
      privacy: 'Dasar Privasi',
      terms: 'Syarat Perkhidmatan',
      compliance: 'Pematuhan'
    }
  }
};
