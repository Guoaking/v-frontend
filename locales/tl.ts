
import { Translation } from '../types';

export const tl: Translation = {
  common: {
    loading: 'Naglo-load...',
    success: 'Tagumpay',
    error: 'Error',
    save: 'I-save ang mga Pagbabago',
    cancel: 'Kanselahin',
    submit: 'Ipasa',
    edit: 'I-edit',
    logout: 'Mag-sign Out',
    dashboard: 'Console',
    api_key: 'API Key',
    copy: 'Kopyahin ang Resulta',
    copied: 'Kinopya!',
    settings: 'Mga Setting ng Koneksyon',
    admin_portal: 'Admin Portal',
    active: 'Aktibo',
    revoked: 'Binawi',
    suspended: 'Suspendido',
    pending: 'Nakabinbin',
    month: 'buwan',
    date: 'Petsa',
    status: 'Katayuan',
    actions: 'Mga Aksyon'
  },
  nav: {
    home: 'Home',
    products: 'Mga Produkto',
    solutions: 'Mga Solusyon',
    developers: 'Mga Developer',
    pricing: 'Pagpepresyo',
    about: 'Tungkol sa',
    login: 'Mag-login',
    register: 'Magsimula',
    profile: 'Account',
    contact: 'Makipag-ugnayan sa Sales'
  },
  auth: {
    login_title: 'Maligayang Pagbabalik',
    login_subtitle: 'Mag-sign in upang ma-access ang iyong developer console',
    register_title: 'Gumawa ng Account',
    register_subtitle: 'Simulan ang iyong libreng pagsubok na may 1,000 API calls',
    email_placeholder: 'pangalan@kompanya.com',
    password_placeholder: 'Password',
    name_placeholder: 'Buong Pangalan',
    company_placeholder: 'Pangalan ng Kompanya',
    forgot_password: 'Nakalimutan ang Password?',
    dont_have_account: "Wala pang account? Mag-sign up",
    already_have_account: 'May account na? Mag-sign in',
    social_login: 'O magpatuloy gamit ang',
    privacy_agreement: 'Sa pagpapatuloy, sumasang-ayon ka sa aming Mga Tuntunin at Patakaran sa Privacy.',
    login_as_admin: 'Mag-login bilang Admin (Demo)',
    login_failed: 'Hindi valid ang email o password',
    register_failed: 'Nabigo ang pagpaparehistro. Maaaring ginagamit na ang email.'
  },
  console: {
    overview: 'Pangkalahatang-ideya',
    credentials: 'Mga Kredensyal ng API',
    usage: 'Paggamit at Mga Limitasyon',
    logs: 'Mga Log ng API',
    billing: 'Pagsingil',
    team: 'Mga Miyembro ng Team',
    settings: 'Mga Setting ng Account',
    integration: 'Integrasyon',
    webhooks: 'Webhooks',
    create_key: 'Gumawa ng Bagong Key',
    revoke: 'Bawiin',
    total_requests: 'Kabuuang mga Kahilingan',
    error_rate: 'Rate ng Error',
    recent_activity: 'Kamakailang Aktibidad',
    key_name_placeholder: 'Pangalan ng Key (hal. Prod Server)',
    security: 'Seguridad',
    profile: 'Profile',
    preferences: 'Mga Kagustuhan',
    change_password: 'Palitan ang Password',
    mfa: 'Multi-Factor Authentication',
    danger_zone: 'Danger Zone',
    delete_account: 'Tanggalin ang Account',
    scopes: 'Mga Saklaw ng API',
    select_scopes: 'Piliin ang mga pahintulot para sa key na ito',
    ip_whitelist: 'Whitelist ng IP',
    ip_placeholder: 'hal. 192.168.1.0/24 (Opsyonal)',
    active_keys: 'Mga Aktibong Key',
    key_name: 'Pangalan ng Key',
    token: 'Token',
    created: 'Ginawa',
  },
  profile: {
    title: 'Profile',
    pro_plan: 'Pro Plan',
    no_company: 'Walang Kompanya',
    key_desc: 'Gamitin ang key na ito upang patotohanan ang iyong mga kahilingan sa API. Huwag ibahagi ang key na ito.',
    no_key: 'Walang API Key na Natagpuan',
    security_overview: 'Pangkalahatang-ideya ng Seguridad',
    account_protected: 'Protektado ang Account',
    mfa_enabled: 'MFA ay pinagana sa pamamagitan ng Google Auth',
    full_name: 'Buong Pangalan',
    company: 'Kompanya',
    change_avatar: 'Palitan ang Avatar',
    avatar_help: 'JPG, GIF o PNG. Max size 800K'
  },
  settings: {
    current_password: 'Kasalukuyang Password',
    new_password: 'Bagong Password',
    update_password: 'I-update ang Password',
    mfa_title: 'Two-factor authentication',
    mfa_desc: 'Magdagdag ng karagdagang layer ng seguridad sa iyong account.',
    danger_desc: 'Kapag tinanggal mo ang iyong account, wala nang balikan. Mangyaring siguraduhin.',
    dark_mode: 'Dark Mode',
    dark_mode_desc: 'I-toggle ang dark theme para sa console.',
    switch_light: 'Lumipat sa Light',
    switch_dark: 'Lumipat sa Dark',
    language: 'Wika',
    language_desc: 'Piliin ang iyong ginustong wika ng interface.'
  },
  billing: {
    current_plan: 'Kasalukuyang Plano',
    upgrade: 'I-upgrade ang Plano',
    payment_method: 'Paraan ng Pagbabayad',
    invoices: 'Kasaysayan ng Invoice',
    usage_limit: 'Limitasyon ng Paggamit',
    next_invoice: 'Susunod na Invoice',
    plan: 'Plano',
    cancel_sub: 'Kanselahin ang Suskrisyon',
    update_card: 'I-update ang Card',
    invoice_id: 'ID ng Invoice',
    amount: 'Halaga',
    download: 'I-download',
    expires: 'Mag-eexpire',
  },
  team: {
    invite_member: 'Mag-imbita ng Miyembro',
    role: 'Tungkulin',
    status: 'Katayuan',
    actions: 'Mga Aksyon',
    invite_placeholder: 'katrabaho@kompanya.com',
    remove_member: 'Alisin ang Miyembro'
  },
  oauth: {
    title: 'Mga Kliyente ng OAuth',
    subtitle: 'Pamahalaan ang iyong mga OAuth 2.0 client para sa secure na server-to-server integration.',
    create_client: 'Irehistro ang Client',
    client_name: 'Pangalan ng Client',
    client_id: 'Client ID',
    scopes: 'Mga Saklaw',
    redirect_uri: 'Redirect URI',
    create_desc: 'Magrehistro ng bagong application upang makakuha ng Client Credentials.',
    secret_warning: 'Ang client secret na ito ay ipapakita lamang ng isang beses. Itago ito nang secure.',
    description: 'Paglalarawan'
  },
  admin: {
    dashboard: 'Dashboard',
    users: 'Pamamahala ng User',
    organizations: 'Mga Organisasyon',
    plans: 'Pamamahala ng Plano',
    system: 'Kalusugan ng Sistema',
    audit: 'Mga Audit Log',
    monitor: 'Monitor ng Sistema',
    total_users: 'Kabuuang mga User',
    active_keys: 'Mga Aktibong API Key',
    system_health: 'Kalusugan ng Sistema',
    suspend: 'Isuspinde',
    activate: 'I-activate',
    user_management: 'Pamamahala ng User',
    org_management: 'Pamamahala ng Organisasyon',
    search_placeholder: 'Maghanap ng mga user o organisasyon...',
    live_traffic: 'Live Traffic (Mock)',
    system_logs: 'Mga Log ng Sistema',
    columns: {
      user: 'User',
      role: 'Tungkulin',
      org: 'Organisasyon',
      status: 'Katayuan',
      plan: 'Plano',
      members: 'Mga Miyembro',
      usage: 'Paggamit',
      created: 'Ginawa',
      timestamp: 'Timestamp',
      target: 'Target',
      action: 'Aksyon',
      ip: 'IP Address'
    },
    monitor_tabs: {
      overview: 'Pangkalahatang-ideya',
      business: 'Mga Sukatan ng Negosyo',
      security: 'Seguridad'
    }
  },
  hero: {
    title: 'Malalim na Localized AI E-KYC para sa Timog-silangang Asya',
    subtitle: 'Katatagan sa antas ng negosyo na may 99.9% na katumpakan. Na-optimize para sa mga sitwasyon ng pag-verify sa Thailand at SEA.',
    cta_primary: 'Tingnan ang Demo',
    cta_secondary: 'Tingnan ang Dokumentasyon',
  },
  home_stats: {
    yield_label: 'First Pass Yield',
    cost_label: 'Pagbawas ng Gastos',
    docs_label: 'Mga Uri ng Dokumento ng SEA'
  },
  features: {
    title: 'Mga Pangunahing Kakayahan',
    ocr_title: 'Matalinong OCR',
    ocr_desc: 'Umaangkop sa mababang kalidad, liwanag, at kumplikadong mga layout. Espesyalisado para sa mga script ng SEA.',
    liveness_title: 'Passive Liveness',
    liveness_desc: 'Anti-spoofing sa antas ng pagbabangko. Tahimik na pagsusuri + pag-detect ng micro-motion.',
    face_title: 'Pagkilala sa Mukha',
    face_desc: 'Na-optimize para sa mga katangian ng mukha ng Timog-silangang Asya na may mataas na throughput.',
  },
  products: {
    title: 'Mga Module ng Produkto',
    subtitle: 'Komprehensibong kakayahan ng AI na magagamit sa pamamagitan ng API & SDK',
    categories: {
      ocr: 'Module ng OCR',
      liveness: 'Module ng Liveness',
      face: 'Module ng Pagkilala sa Mukha'
    },
    items: {
      custom_template_ocr: 'Custom Template OCR',
      id_quality_check: 'Pagsusuri ng Kalidad ng ID',
      id_card_ocr: 'Pagkilala sa ID Card',
      driver_license_ocr: 'OCR ng Lisensya sa Pagmamaneho',
      vehicle_license_ocr: 'OCR ng Lisensya ng Sasakyan',
      bank_card_ocr: 'OCR ng Bank Card',
      business_license_ocr: 'OCR ng Lisensya sa Negosyo',
      general_ocr: 'Pangkalahatang Pagkilala sa Teksto',
      liveness_silent: 'Tahimik na Liveness',
      liveness_video: 'Video Liveness',
      face_detection: 'Pag-detect ng Mukha',
      face_compare: 'Paghahambing ng Mukha (1:1)',
      face_search: 'Paghahanap ng Mukha (1:N)',
    },
    buttons: {
      api_docs: 'Dokumentasyon ng API',
      live_demo: 'Subukan ang Live Demo'
    },
    demo_labels: {
      ocr: 'Pagsusuri ng Dokumento',
      liveness: 'Anti-Spoofing',
      face: 'Biometric Match'
    }
  },
  solutions: {
    title: 'Itinayo para sa Pagpapalawak',
    subtitle: "Paglutas ng mga partikular na hamon sa pag-verify sa mga pinakamabilis na lumalagong sektor ng Timog-silangang Asya.",
    industries: {
      banking: {
        title: "Pagbabangko at Pananalapi",
        desc: "Pigilan ang pandaraya sa pagkakakilanlan at mga pag-atake ng synthetic ID. I-streamline ang pagbubukas ng account sa < 2 min.",
        kpis: ["-78% Gastos sa Audit", "+52% Conversion"]
      },
      insurance: {
        title: "Insurance at Pangangalagang Pangkalusugan",
        desc: "Digital onboarding para sa mga policyholders. I-verify ang mga pasyente nang malayuan para sa telemedicine.",
        kpis: ["100% Sumusunod", "Walang Hirap"]
      },
      government: {
        title: "Gobyerno at Publiko",
        desc: "Ligtas na pag-access sa mga serbisyo ng mamamayan. Hawakan ang mga peak load sa panahon ng pagbibigay ng subsidiya.",
        kpis: ["Handa sa On-Prem", "Pambansang Saklaw"]
      },
      commerce: {
        title: "Digital Commerce",
        desc: "Arkitektura ng tiwala para sa mga marketplace. I-verify ang mga nagbebenta at mamimili na may mataas na halaga.",
        kpis: ["Real-time", "Anti-Fraud"]
      },
      mobility: {
        title: "Mobility at Logistics",
        desc: "Pag-verify ng driver para sa ride-hailing. Instant na lisensya OCR para sa mga rental.",
        kpis: ["Kaligtasan ng Driver", "Mabilis na Check-in"]
      },
      telecom: {
        title: "Telecom",
        desc: "Pagsunod sa pagpaparehistro ng SIM (NBTC/Kominfo). Store-front at remote activation.",
        kpis: ["RegTech", "Omnichannel"]
      },
    },
    case_study: {
      title: 'Kuwento ng Tagumpay',
      subtitle: 'Paano binawasan ng isang Nangungunang Thai HR Platform ang oras ng onboarding nang 90%',
      desc: "Sa pamamagitan ng pagsasama ng ID OCR at Liveness detection ng Verilocale, inalis ng platform ang mga manu-manong pagsusuri ng dokumento para sa 50,000+ gig economy workers buwan-buwan.",
      cta: 'Basahin ang Case Study'
    }
  },
  playground: {
    title: 'Multi-Modal Workbench',
    subtitle: 'Subukan ang aming mga modelo ng AI gamit ang Imahe, Video, at Paghahambing.',
    select_capability: 'Piliin ang Kakayahan',
    upload_text: 'Ilagay ang imahe dito o i-click upang mag-upload',
    analyzing: 'Pinoproseso...',
    results: 'Mga Resulta ng Pagsusuri',
    json_view: 'JSON',
    raw_view: 'Raw',
    config_title: 'Konfigurasyon ng API',
    base_url: 'Base URL',
    token: 'Bearer Token',
    run_analysis: 'Patakbuhin ang Pagsusuri',
    select_key: 'Piliin ang API Key',
    no_keys: 'Walang nahanap na aktibong key',
    create_key_prompt: 'Gumawa ng key sa Console',
    ocr_language: 'Wika ng Dokumento'
  },
  chat: {
    welcome: "Kamusta! Ako si VeriBot. Paano kita matutulungan sa mga API ng Verilocale ngayon?",
    placeholder: "Mag-type ng mensahe...",
    history: "Kasaysayan ng Pag-uusap",
    new_chat: "Bagong Chat",
    no_history: "Wala pang kasaysayan",
    powered_by: "Pinapatakbo ng Gemini. Ang AI ay maaaring magkamali.",
    error_response: "Nagkakaproblema ako sa pagkonekta sa knowledge base ngayon. Mangyaring subukan muli mamaya."
  },
  footer: {
    rights: 'Lahat ng karapatan ay nakalaan.',
    partner: 'Kasosyong Software ni',
    desc: "Inaayos ang tiwala para sa digital na ekonomiya ng Timog-silangang Asya. Enterprise-grade OCR at Pag-verify ng Pagkakakilanlan.",
    legal_header: 'Legal at Pagsunod',
    links: {
      api_ref: 'Sanggunian ng API',
      contact: 'Makipag-ugnayan sa Amin'
    },
    legal: {
      privacy: 'Patakaran sa Privacy',
      terms: 'Mga Tuntunin ng Serbisyo',
      compliance: 'Pagsunod'
    }
  }
};
