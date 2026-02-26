
import { Translation } from '../types';

export const id: Translation = {
  common: {
    loading: 'Memuat...',
    success: 'Berhasil',
    error: 'Kesalahan',
    save: 'Simpan Perubahan',
    cancel: 'Batal',
    submit: 'Kirim',
    edit: 'Ubah',
    logout: 'Keluar',
    dashboard: 'Konsol',
    api_key: 'Kunci API',
    copy: 'Salin Hasil',
    copied: 'Disalin!',
    settings: 'Pengaturan Koneksi',
    admin_portal: 'Portal Admin',
    active: 'Aktif',
    revoked: 'Dicabut',
    suspended: 'Ditangguhkan',
    pending: 'Tertunda',
    month: 'bulan',
    date: 'Tanggal',
    status: 'Status',
    actions: 'Tindakan'
  },
  nav: {
    home: 'Beranda',
    products: 'Produk',
    solutions: 'Solusi',
    developers: 'Pengembang',
    pricing: 'Harga',
    about: 'Tentang',
    login: 'Masuk',
    register: 'Mulai',
    profile: 'Akun',
    contact: 'Hubungi Penjualan'
  },
  auth: {
    login_title: 'Selamat Datang Kembali',
    login_subtitle: 'Masuk untuk mengakses konsol pengembang Anda',
    register_title: 'Buat Akun',
    register_subtitle: 'Mulai uji coba gratis Anda dengan 1.000 panggilan API',
    email_placeholder: 'nama@perusahaan.com',
    password_placeholder: 'Kata Sandi',
    name_placeholder: 'Nama Lengkap',
    company_placeholder: 'Nama Perusahaan',
    forgot_password: 'Lupa Kata Sandi?',
    dont_have_account: "Belum punya akun? Daftar",
    already_have_account: 'Sudah punya akun? Masuk',
    social_login: 'Atau lanjutkan dengan',
    privacy_agreement: 'Dengan melanjutkan, Anda menyetujui Ketentuan dan Kebijakan Privasi kami.',
    login_as_admin: 'Masuk sebagai Admin (Demo)',
    login_failed: 'Email atau kata sandi tidak valid',
    register_failed: 'Pendaftaran gagal. Email mungkin sudah digunakan.'
  },
  console: {
    overview: 'Ikhtisar',
    credentials: 'Kredensial API',
    usage: 'Penggunaan & Batas',
    logs: 'Log API',
    billing: 'Penagihan',
    team: 'Anggota Tim',
    settings: 'Pengaturan Akun',
    integration: 'Integrasi',
    webhooks: 'Webhooks',
    create_key: 'Buat Kunci Baru',
    revoke: 'Cabut',
    total_requests: 'Total Permintaan',
    error_rate: 'Tingkat Kesalahan',
    recent_activity: 'Aktivitas Terbaru',
    key_name_placeholder: 'Nama Kunci (mis. Server Prod)',
    security: 'Keamanan',
    profile: 'Profil',
    preferences: 'Preferensi',
    change_password: 'Ubah Kata Sandi',
    mfa: 'Otentikasi Multi-Faktor',
    danger_zone: 'Zona Bahaya',
    delete_account: 'Hapus Akun',
    scopes: 'Cakupan API',
    select_scopes: 'Pilih izin untuk kunci ini',
    ip_whitelist: 'Daftar Putih IP',
    ip_placeholder: 'mis. 192.168.1.0/24 (Opsional)',
    active_keys: 'Kunci Aktif',
    key_name: 'Nama Kunci',
    token: 'Token',
    created: 'Dibuat',
  },
  profile: {
    title: 'Profil',
    pro_plan: 'Paket Pro',
    no_company: 'Tidak Ada Perusahaan',
    key_desc: 'Gunakan kunci ini untuk mengotentikasi permintaan API Anda. Jangan bagikan kunci ini.',
    no_key: 'Kunci API Tidak Ditemukan',
    security_overview: 'Ikhtisar Keamanan',
    account_protected: 'Akun Terlindungi',
    mfa_enabled: 'MFA diaktifkan melalui Google Auth',
    full_name: 'Nama Lengkap',
    company: 'Perusahaan',
    change_avatar: 'Ubah Avatar',
    avatar_help: 'JPG, GIF atau PNG. Ukuran maks 800K'
  },
  settings: {
    current_password: 'Kata Sandi Saat Ini',
    new_password: 'Kata Sandi Baru',
    update_password: 'Perbarui Kata Sandi',
    mfa_title: 'Otentikasi dua faktor',
    mfa_desc: 'Tambahkan lapisan keamanan ekstra ke akun Anda.',
    danger_desc: 'Setelah Anda menghapus akun, tidak ada jalan kembali. Harap yakin.',
    dark_mode: 'Mode Gelap',
    dark_mode_desc: 'Beralih tema gelap untuk konsol.',
    switch_light: 'Beralih ke Terang',
    switch_dark: 'Beralih ke Gelap',
    language: 'Bahasa',
    language_desc: 'Pilih bahasa antarmuka pilihan Anda.'
  },
  billing: {
    current_plan: 'Paket Saat Ini',
    upgrade: 'Tingkatkan Paket',
    payment_method: 'Metode Pembayaran',
    invoices: 'Riwayat Faktur',
    usage_limit: 'Batas Penggunaan',
    next_invoice: 'Faktur Berikutnya',
    plan: 'Paket',
    cancel_sub: 'Batalkan Langganan',
    update_card: 'Perbarui Kartu',
    invoice_id: 'ID Faktur',
    amount: 'Jumlah',
    download: 'Unduh',
    expires: 'Kadaluwarsa',
  },
  team: {
    invite_member: 'Undang Anggota',
    role: 'Peran',
    status: 'Status',
    actions: 'Tindakan',
    invite_placeholder: 'kolega@perusahaan.com',
    remove_member: 'Hapus Anggota'
  },
  oauth: {
    title: 'Klien OAuth',
    subtitle: 'Kelola klien OAuth 2.0 Anda untuk integrasi server-ke-server yang aman.',
    create_client: 'Daftarkan Klien',
    client_name: 'Nama Klien',
    client_id: 'ID Klien',
    scopes: 'Cakupan',
    redirect_uri: 'URI Pengalihan',
    create_desc: 'Daftarkan aplikasi baru untuk mendapatkan Kredensial Klien.',
    secret_warning: 'Rahasia klien ini hanya akan ditampilkan sekali. Simpan dengan aman.',
    description: 'Deskripsi'
  },
  admin: {
    dashboard: 'Dasbor',
    users: 'Manajemen Pengguna',
    organizations: 'Organisasi',
    plans: 'Manajemen Paket',
    system: 'Kesehatan Sistem',
    audit: 'Log Audit',
    monitor: 'Monitor Sistem',
    total_users: 'Total Pengguna',
    active_keys: 'Kunci API Aktif',
    system_health: 'Kesehatan Sistem',
    suspend: 'Tangguhkan',
    activate: 'Aktifkan',
    user_management: 'Manajemen Pengguna',
    org_management: 'Manajemen Organisasi',
    search_placeholder: 'Cari pengguna atau organisasi...',
    live_traffic: 'Lalu Lintas Langsung (Mock)',
    system_logs: 'Log Sistem',
    columns: {
      user: 'Pengguna',
      role: 'Peran',
      org: 'Organisasi',
      status: 'Status',
      plan: 'Paket',
      members: 'Anggota',
      usage: 'Penggunaan',
      created: 'Dibuat',
      timestamp: 'Waktu',
      target: 'Target',
      action: 'Tindakan',
      ip: 'Alamat IP'
    },
    monitor_tabs: {
      overview: 'Ikhtisar',
      business: 'Metrik Bisnis',
      security: 'Keamanan'
    }
  },
  hero: {
    title: 'AI E-KYC yang Sangat Terlokalisasi untuk Asia Tenggara',
    subtitle: 'Stabilitas tingkat perusahaan dengan akurasi 99,9%. Dioptimalkan untuk skenario verifikasi Thailand & SEA.',
    cta_primary: 'Lihat Demo',
    cta_secondary: 'Lihat Dokumentasi',
  },
  home_stats: {
    yield_label: 'Hasil Lulus Pertama',
    cost_label: 'Pengurangan Biaya',
    docs_label: 'Jenis Dokumen SEA'
  },
  features: {
    title: 'Kemampuan Inti',
    ocr_title: 'OCR Cerdas',
    ocr_desc: 'Beradaptasi dengan kualitas rendah, silau, dan tata letak yang kompleks. Khusus untuk skrip SEA.',
    liveness_title: 'Liveness Pasif',
    liveness_desc: 'Anti-spoofing tingkat perbankan. Pemeriksaan diam + deteksi gerakan mikro.',
    face_title: 'Pengenalan Wajah',
    face_desc: 'Dioptimalkan untuk karakteristik wajah Asia Tenggara dengan throughput tinggi.',
  },
  products: {
    title: 'Modul Produk',
    subtitle: 'Kemampuan AI komprehensif tersedia melalui API & SDK',
    categories: {
      ocr: 'Modul OCR',
      liveness: 'Modul Liveness',
      face: 'Modul Pengenalan Wajah'
    },
    items: {
      custom_template_ocr: 'OCR Templat Kustom',
      id_quality_check: 'Pemeriksaan Kualitas ID',
      id_card_ocr: 'Pengenalan Kartu ID',
      driver_license_ocr: 'OCR SIM',
      vehicle_license_ocr: 'OCR STNK',
      bank_card_ocr: 'OCR Kartu Bank',
      business_license_ocr: 'OCR Izin Usaha',
      general_ocr: 'Pengenalan Teks Umum',
      id_npwp_ocr: 'OCR NPWP (Pajak)',
      liveness_silent: 'Liveness Diam',
      liveness_video: 'Liveness Video',
      face_detection: 'Deteksi Wajah',
      face_compare: 'Perbandingan Wajah (1:1)',
      face_search: 'Pencarian Wajah (1:N)',
    },
    buttons: {
      api_docs: 'Dokumentasi API',
      live_demo: 'Coba Demo Langsung'
    },
    demo_labels: {
      ocr: 'Analisis Dokumen',
      liveness: 'Anti-Spoofing',
      face: 'Pencocokan Biometrik'
    }
  },
  solutions: {
    title: 'Dibangun untuk Skala',
    subtitle: "Memecahkan tantangan verifikasi spesifik di sektor-sektor dengan pertumbuhan tercepat di Asia Tenggara.",
    industries: {
      banking: {
        title: "Perbankan & Keuangan",
        desc: "Mencegah penipuan identitas dan serangan ID sintetis. Mempercepat pembukaan rekening < 2 menit.",
        kpis: ["-78% Biaya Audit", "+52% Konversi"]
      },
      insurance: {
        title: "Asuransi & Kesehatan",
        desc: "Onboarding digital untuk pemegang polis. Verifikasi pasien dari jarak jauh untuk telemedis.",
        kpis: ["100% Patuh", "Tanpa Gesekan"]
      },
      government: {
        title: "Pemerintah & Publik",
        desc: "Akses aman ke layanan warga. Menangani beban puncak selama penyaluran subsidi.",
        kpis: ["Siap On-Prem", "Skala Nasional"]
      },
      commerce: {
        title: "Perdagangan Digital",
        desc: "Arsitektur kepercayaan untuk pasar. Verifikasi penjual dan pembeli bernilai tinggi.",
        kpis: ["Real-time", "Anti-Penipuan"]
      },
      mobility: {
        title: "Mobilitas & Logistik",
        desc: "Verifikasi pengemudi untuk transportasi online. OCR lisensi instan untuk penyewaan.",
        kpis: ["Keamanan Pengemudi", "Check-in Cepat"]
      },
      telecom: {
        title: "Telekomunikasi",
        desc: "Kepatuhan pendaftaran SIM (NBTC/Kominfo). Aktivasi di toko dan jarak jauh.",
        kpis: ["RegTech", "Omnichannel"]
      },
    },
    case_study: {
      title: 'Kisah Sukses',
      subtitle: 'Bagaimana Platform HR Terkemuka Thailand mengurangi waktu onboarding sebesar 90%',
      desc: "Dengan mengintegrasikan OCR ID dan deteksi Liveness Verilocale, platform ini menghilangkan pemeriksaan dokumen manual untuk 50.000+ pekerja gig setiap bulan.",
      cta: 'Baca Studi Kasus'
    }
  },
  playground: {
    title: 'Meja Kerja Multi-Modal',
    subtitle: 'Uji model AI kami dengan kemampuan Gambar, Video, dan Perbandingan.',
    select_capability: 'Pilih Kemampuan',
    upload_text: 'Jatuhkan gambar di sini atau klik untuk mengunggah',
    analyzing: 'Sedang Memproses...',
    results: 'Hasil Analisis',
    json_view: 'JSON',
    raw_view: 'Mentah',
    config_title: 'Konfigurasi API',
    base_url: 'URL Dasar',
    token: 'Token Bearer',
    run_analysis: 'Jalankan Analisis',
    select_key: 'Pilih Kunci API',
    no_keys: 'Tidak ada kunci aktif ditemukan',
    create_key_prompt: 'Buat kunci di Konsol',
    ocr_language: 'Bahasa Dokumen'
  },
  chat: {
    welcome: "Halo! Saya VeriBot. Bagaimana saya dapat membantu Anda dengan API Verilocale hari ini?",
    placeholder: "Ketik pesan...",
    history: "Riwayat Percakapan",
    new_chat: "Obrolan Baru",
    no_history: "Belum ada riwayat",
    powered_by: "Didukung oleh Gemini. AI dapat membuat kesalahan.",
    error_response: "Saya mengalami masalah saat menyambung ke basis pengetahuan saat ini. Silakan coba lagi nanti."
  },
  footer: {
    rights: 'Hak cipta dilindungi undang-undang.',
    partner: 'Perangkat Lunak Mitra oleh',
    desc: "Merekayasa kepercayaan untuk ekonomi digital Asia Tenggara. OCR dan Verifikasi Identitas tingkat perusahaan.",
    legal_header: 'Hukum & Kepatuhan',
    links: {
      api_ref: 'Referensi API',
      contact: 'Hubungi Kami'
    },
    legal: {
      privacy: 'Kebijakan Privasi',
      terms: 'Ketentuan Layanan',
      compliance: 'Kepatuhan'
    }
  }
};
