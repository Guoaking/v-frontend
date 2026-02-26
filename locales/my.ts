
import { Translation } from '../types';

export const my: Translation = {
  common: {
    loading: 'Loading...', // Keep English for technical terms often used in Myanmar tech
    success: 'အောင်မြင်သည်',
    error: 'Error',
    save: 'သိမ်းဆည်းမည်',
    cancel: 'မလုပ်တော့ပါ',
    submit: 'တင်သွင်းမည်',
    edit: 'ပြင်ဆင်မည်',
    logout: 'အကောင့်ထွက်မည်',
    dashboard: 'Dashboard',
    api_key: 'API Key',
    copy: 'မိတ္တူကူးမည်',
    copied: 'ကူးယူပြီး!',
    settings: 'ဆက်သွယ်မှု ဆက်တင်များ',
    admin_portal: 'Admin Portal',
    active: 'အသက်ဝင်သည်',
    revoked: 'ပယ်ဖျက်ပြီး',
    suspended: 'ဆိုင်းငံ့ထားသည်',
    pending: 'စောင့်ဆိုင်းနေသည်',
    month: 'လ',
    date: 'နေ့စွဲ',
    status: 'အခြေအနေ',
    actions: 'လုပ်ဆောင်ချက်များ'
  },
  nav: {
    home: 'ပင်မစာမျက်နှာ',
    products: 'ထုတ်ကုန်များ',
    solutions: 'ဖြေရှင်းနည်းများ',
    developers: 'Developers',
    pricing: 'ဈေးနှုန်းများ',
    about: 'အကြောင်း',
    login: 'အကောင့်ဝင်မည်',
    register: 'စတင်မည်',
    profile: 'အကောင့်',
    contact: 'အရောင်းဌာနသို့ ဆက်သွယ်ရန်'
  },
  auth: {
    login_title: 'ကြိုဆိုပါတယ်',
    login_subtitle: 'Developer console သို့ ဝင်ရောက်ရန် အကောင့်ဝင်ပါ',
    register_title: 'အကောင့်ဖွင့်မည်',
    register_subtitle: 'API calls 1,000 နှင့် အခမဲ့စမ်းသပ်မှု စတင်ပါ',
    email_placeholder: 'name@company.com',
    password_placeholder: 'စကားဝှက်',
    name_placeholder: 'နာမည်အပြည့်အစုံ',
    company_placeholder: 'ကုမ္ပဏီအမည်',
    forgot_password: 'စကားဝှက်မေ့နေပါသလား?',
    dont_have_account: "အကောင့်မရှိဘူးလား? စာရင်းသွင်းမည်",
    already_have_account: 'အကောင့်ရှိပြီးသားလား? အကောင့်ဝင်မည်',
    social_login: 'သို့မဟုတ် ဖြင့် ဆက်လက်ဆောင်ရွက်မည်',
    privacy_agreement: 'ဆက်လက်ဆောင်ရွက်ခြင်းဖြင့် ကျွန်ုပ်တို့၏ စည်းမျဉ်းများနှင့် ကိုယ်ရေးအချက်အလက်မူဝါဒကို သဘောတူပါသည်။',
    login_as_admin: 'Admin အနေဖြင့် ဝင်မည် (Demo)',
    login_failed: 'အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်',
    register_failed: 'စာရင်းသွင်းခြင်း မအောင်မြင်ပါ။ အီးမေးလ်ကို အသုံးပြုထားပြီးဖြစ်နိုင်ပါသည်။'
  },
  console: {
    overview: 'ခြုံငုံသုံးသပ်ချက်',
    credentials: 'API Credentials',
    usage: 'အသုံးပြုမှုနှင့် ကန့်သတ်ချက်များ',
    logs: 'API Logs',
    billing: 'ငွေပေးချေမှု',
    team: 'အဖွဲ့ဝင်များ',
    settings: 'အကောင့်ဆက်တင်များ',
    integration: 'Integration',
    webhooks: 'Webhooks',
    create_key: 'Key အသစ် ဖန်တီးမည်',
    revoke: 'ပယ်ဖျက်မည်',
    total_requests: 'စုစုပေါင်း တောင်းဆိုမှုများ',
    error_rate: 'Error နှုန်း',
    recent_activity: 'လတ်တလော လှုပ်ရှားမှု',
    key_name_placeholder: 'Key နာမည် (ဥပမာ - Prod Server)',
    security: 'လုံခြုံရေး',
    profile: 'ပရိုဖိုင်',
    preferences: 'Preferences',
    change_password: 'စကားဝှက်ပြောင်းမည်',
    mfa: 'Multi-Factor Authentication',
    danger_zone: 'အန္တရာယ်ဇုန်',
    delete_account: 'အကောင့်ဖျက်မည်',
    scopes: 'API Scopes',
    select_scopes: 'ဤ key အတွက် ခွင့်ပြုချက်များ ရွေးပါ',
    ip_whitelist: 'IP Whitelist',
    ip_placeholder: 'ဥပမာ 192.168.1.0/24 (Optional)',
    active_keys: 'Active Keys',
    key_name: 'Key နာမည်',
    token: 'Token',
    created: 'ဖန်တီးခဲ့သည့်အချိန်',
  },
  profile: {
    title: 'ပရိုဖိုင်',
    pro_plan: 'Pro Plan',
    no_company: 'ကုမ္ပဏီမရှိပါ',
    key_desc: 'သင်၏ API requests များကို စစ်ဆေးရန် ဤ key ကို အသုံးပြုပါ။ ဤ key ကို မမျှဝေပါနှင့်။',
    no_key: 'API Key မတွေ့ပါ',
    security_overview: 'လုံခြုံရေး ခြုံငုံသုံးသပ်ချက်',
    account_protected: 'အကောင့် လုံခြုံပါသည်',
    mfa_enabled: 'MFA ကို Google Auth ဖြင့် ဖွင့်ထားသည်',
    full_name: 'နာမည်အပြည့်အစုံ',
    company: 'ကုမ္ပဏီ',
    change_avatar: 'ပုံပြောင်းမည်',
    avatar_help: 'JPG, GIF သို့မဟုတ် PNG. အများဆုံး 800K'
  },
  settings: {
    current_password: 'လက်ရှိ စကားဝှက်',
    new_password: 'စကားဝှက်အသစ်',
    update_password: 'စကားဝှက် အပ်ဒိတ်လုပ်မည်',
    mfa_title: 'Two-factor authentication',
    mfa_desc: 'သင်၏ အကောင့်အတွက် လုံခြုံရေးအလွှာ ထပ်ပေါင်းထည့်ပါ။',
    danger_desc: 'အကောင့်ကို ဖျက်လိုက်ပါက ပြန်ယူ၍မရပါ။ သေချာပါစေ။',
    dark_mode: 'Dark Mode',
    dark_mode_desc: 'console အတွက် dark theme ကို ပြောင်းပါ။',
    switch_light: 'Light သို့ ပြောင်းမည်',
    switch_dark: 'Dark သို့ ပြောင်းမည်',
    language: 'ဘာသာစကား',
    language_desc: 'သင်နှစ်သက်သော ဘာသာစကားကို ရွေးချယ်ပါ။'
  },
  billing: {
    current_plan: 'လက်ရှိ Plan',
    upgrade: 'Plan မြှင့်မည်',
    payment_method: 'ငွေပေးချေမှု နည်းလမ်း',
    invoices: 'Invoice မှတ်တမ်း',
    usage_limit: 'အသုံးပြုမှု ကန့်သတ်ချက်',
    next_invoice: 'နောက်ထပ် Invoice',
    plan: 'Plan',
    cancel_sub: 'Subscription ပယ်ဖျက်မည်',
    update_card: 'ကတ် အပ်ဒိတ်လုပ်မည်',
    invoice_id: 'Invoice ID',
    amount: 'ပမာဏ',
    download: 'ဒေါင်းလုဒ်',
    expires: 'ကုန်ဆုံးမည့်ရက်',
  },
  team: {
    invite_member: 'အဖွဲ့ဝင် ဖိတ်ကြားမည်',
    role: 'Role',
    status: 'အခြေအနေ',
    actions: 'လုပ်ဆောင်ချက်များ',
    invite_placeholder: 'colleague@company.com',
    remove_member: 'အဖွဲ့ဝင်ကို ဖယ်ရှားမည်'
  },
  oauth: {
    title: 'OAuth Clients',
    subtitle: 'လုံခြုံသော server-to-server integration အတွက် OAuth 2.0 clients များကို စီမံခန့်ခွဲပါ။',
    create_client: 'Client မှတ်ပုံတင်မည်',
    client_name: 'Client နာမည်',
    client_id: 'Client ID',
    scopes: 'Scopes',
    redirect_uri: 'Redirect URI',
    create_desc: 'Client Credentials ရယူရန် အပလီကေးရှင်းအသစ် မှတ်ပုံတင်ပါ။',
    secret_warning: 'ဤ client secret ကို တစ်ကြိမ်သာ ပြသပါမည်။ လုံခြုံစွာ သိမ်းဆည်းပါ။',
    description: 'ဖော်ပြချက်'
  },
  admin: {
    dashboard: 'Dashboard',
    users: 'အသုံးပြုသူ စီမံခန့်ခွဲမှု',
    organizations: 'အဖွဲ့အစည်းများ',
    plans: 'Plan စီမံခန့်ခွဲမှု',
    system: 'စနစ် ကျန်းမာရေး',
    audit: 'Audit Logs',
    monitor: 'စနစ် စောင့်ကြည့်မှု',
    total_users: 'စုစုပေါင်း အသုံးပြုသူများ',
    active_keys: 'Active API Keys',
    system_health: 'စနစ် ကျန်းမာရေး',
    suspend: 'ဆိုင်းငံ့မည်',
    activate: 'အသက်သွင်းမည်',
    user_management: 'အသုံးပြုသူ စီမံခန့်ခွဲမှု',
    org_management: 'အဖွဲ့အစည်း စီမံခန့်ခွဲမှု',
    search_placeholder: 'အသုံးပြုသူ သို့မဟုတ် အဖွဲ့အစည်း ရှာဖွေပါ...',
    live_traffic: 'Live Traffic (Mock)',
    system_logs: 'System Logs',
    columns: {
      user: 'User',
      role: 'Role',
      org: 'Organization',
      status: 'Status',
      plan: 'Plan',
      members: 'Members',
      usage: 'Usage',
      created: 'Created',
      timestamp: 'Timestamp',
      target: 'Target',
      action: 'Action',
      ip: 'IP Address'
    },
    monitor_tabs: {
      overview: 'Overview',
      business: 'Business Metrics',
      security: 'Security'
    }
  },
  hero: {
    title: 'အရှေ့တောင်အာရှအတွက် ဒေသတွင်းသုံး AI E-KYC',
    subtitle: '99.9% တိကျမှန်ကန်မှုရှိသော လုပ်ငန်းသုံး အဆင့်မီ စနစ်။ ထိုင်းနှင့် SEA စစ်ဆေးမှုများအတွက် အထူးပြုလုပ်ထားသည်။',
    cta_primary: 'Demo ကြည့်မည်',
    cta_secondary: 'စာရွက်စာတမ်းများ ကြည့်မည်',
  },
  home_stats: {
    yield_label: 'ပထမအကြိမ် အောင်မြင်မှု',
    cost_label: 'ကုန်ကျစရိတ် လျှော့ချမှု',
    docs_label: 'SEA စာရွက်စာတမ်း အမျိုးအစားများ'
  },
  features: {
    title: 'အဓိက စွမ်းဆောင်ရည်များ',
    ocr_title: 'အသိဉာဏ်ရှိသော OCR',
    ocr_desc: 'အရည်အသွေးနိမ့်ခြင်း၊ အလင်းပြန်ခြင်းနှင့် ရှုပ်ထွေးသော ပုံစံများကို ကိုင်တွယ်နိုင်သည်။ SEA စာလုံးများအတွက် အထူးပြုသည်။',
    liveness_title: 'Passive Liveness',
    liveness_desc: 'ဘဏ်လုပ်ငန်းအဆင့် အတုအပ ကာကွယ်ခြင်း။ အသံတိတ် စစ်ဆေးမှု + အသေးစား လှုပ်ရှားမှု ရှာဖွေခြင်း။',
    face_title: 'မျက်နှာ မှတ်သားခြင်း',
    face_desc: 'အရှေ့တောင်အာရှ လူမျိုးများ၏ မျက်နှာသွင်ပြင်များအတွက် အထူးပြုလုပ်ထားသည်။',
  },
  products: {
    title: 'ထုတ်ကုန် မော်ဂျူးများ',
    subtitle: 'API & SDK မှတဆင့် ရရှိနိုင်သော ပြည့်စုံသော AI စွမ်းဆောင်ရည်များ',
    categories: {
      ocr: 'OCR Module',
      liveness: 'Liveness Module',
      face: 'Face Recognition Module'
    },
    items: {
      custom_template_ocr: 'Custom Template OCR',
      id_quality_check: 'ID Quality Check',
      id_card_ocr: 'ID Card Recognition',
      driver_license_ocr: 'Driver License OCR',
      vehicle_license_ocr: 'Vehicle License OCR',
      bank_card_ocr: 'Bank Card OCR',
      business_license_ocr: 'Business License OCR',
      general_ocr: 'General Text Recognition',
      liveness_silent: 'Silent Liveness',
      liveness_video: 'Video Liveness',
      face_detection: 'Face Detection',
      face_compare: 'Face Comparison (1:1)',
      face_search: 'Face Search (1:N)',
    },
    buttons: {
      api_docs: 'API Documentation',
      live_demo: 'Live Demo စမ်းမည်'
    },
    demo_labels: {
      ocr: 'Document Analysis',
      liveness: 'Anti-Spoofing',
      face: 'Biometric Match'
    }
  },
  solutions: {
    title: 'အတိုင်းအတာကြီးမားရန် တည်ဆောက်ထားသည်',
    subtitle: "အရှေ့တောင်အာရှ၏ အလျင်မြန်ဆုံး ကြီးထွားနေသော ကဏ္ဍများတွင် အထူးသဖြင့် အတည်ပြုခြင်း စိန်ခေါ်မှုများကို ဖြေရှင်းပေးသည်။",
    industries: {
      banking: {
        title: "ဘဏ်လုပ်ငန်းနှင့် ဘဏ္ဍာရေး",
        desc: "အထောက်အထား လိမ်လည်မှုနှင့် အတုအပ ID တိုက်ခိုက်မှုများကို ကာကွယ်ပါ။ အကောင့်ဖွင့်ခြင်းကို < 2 မိနစ်အတွင်း ပြီးစီးစေသည်။",
        kpis: ["-78% စစ်ဆေးခ", "+52% ပြောင်းလဲမှု"]
      },
      insurance: {
        title: "အာမခံနှင့် ကျန်းမာရေးစောင့်ရှောက်မှု",
        desc: "ပေါ်လစီပိုင်ရှင်များအတွက် ဒစ်ဂျစ်တယ် onboarding။ တယ်လီဆေးပညာအတွက် လူနာများကို အဝေးမှ အတည်ပြုခြင်း။",
        kpis: ["100% လိုက်နာမှု", "Zero Friction"]
      },
      government: {
        title: "အစိုးရနှင့် ပြည်သူ့",
        desc: "နိုင်ငံသား ဝန်ဆောင်မှုများသို့ လုံခြုံစွာ ဝင်ရောက်ခွင့်။ ထောက်ပံ့ကြေး ပေးအပ်စဉ် အမြင့်ဆုံး ဝန်ကို ကိုင်တွယ်ခြင်း။",
        kpis: ["On-Prem Ready", "Nation-Scale"]
      },
      commerce: {
        title: "Digital Commerce",
        desc: "ဈေးကွက်များအတွက် ယုံကြည်မှု တည်ဆောက်ပုံ။ တန်ဖိုးကြီး ရောင်းချသူများနှင့် ဝယ်ယူသူများကို အတည်ပြုခြင်း။",
        kpis: ["Real-time", "Anti-Fraud"]
      },
      mobility: {
        title: "Mobility & Logistics",
        desc: "ယာဉ်မောင်း အတည်ပြုခြင်း။ ငှားရမ်းမှုများအတွက် ချက်ချင်းလိုင်စင် OCR။",
        kpis: ["ယာဉ်မောင်း လုံခြုံရေး", "အမြန် Check-in"]
      },
      telecom: {
        title: "ဆက်သွယ်ရေး",
        desc: "SIM မှတ်ပုံတင်ခြင်း လိုက်နာမှု (NBTC/Kominfo)။ ဆိုင်နှင့် အဝေးမှ အသက်သွင်းခြင်း။",
        kpis: ["RegTech", "Omnichannel"]
      },
    },
    case_study: {
      title: 'အောင်မြင်မှု ဇာတ်လမ်း',
      subtitle: 'ထိပ်တန်း ထိုင်း HR Platform သည် onboarding အချိန်ကို ၉၀% လျှော့ချခဲ့ပုံ',
      desc: "Verilocale ၏ ID OCR နှင့် Liveness detection ကို ပေါင်းစပ်ခြင်းဖြင့်၊ ပလက်ဖောင်းသည် လစဉ် 50,000+ gig economy လုပ်သားများအတွက် လူကိုယ်တိုင် စာရွက်စာတမ်း စစ်ဆေးမှုများကို ဖယ်ရှားခဲ့သည်။",
      cta: 'Case Study ဖတ်မည်'
    }
  },
  playground: {
    title: 'Multi-Modal Workbench',
    subtitle: 'ရုပ်ပုံ၊ ဗီဒီယိုနှင့် နှိုင်းယှဉ်မှု စွမ်းရည်များဖြင့် ကျွန်ုပ်တို့၏ AI မော်ဒယ်များကို စမ်းသပ်ပါ။',
    select_capability: 'စွမ်းရည် ရွေးချယ်ပါ',
    upload_text: 'ပုံကို ဤနေရာတွင် ချပါ သို့မဟုတ် upload လုပ်ရန် နှိပ်ပါ',
    analyzing: 'လုပ်ဆောင်နေသည်...',
    results: 'ခွဲခြမ်းစိတ်ဖြာမှု ရလဒ်များ',
    json_view: 'JSON',
    raw_view: 'Raw',
    config_title: 'API Configuration',
    base_url: 'Base URL',
    token: 'Bearer Token',
    run_analysis: 'Run Analysis',
    select_key: 'API Key ရွေးပါ',
    no_keys: 'Active keys မတွေ့ပါ',
    create_key_prompt: 'Console တွင် key ဖန်တီးပါ',
    ocr_language: 'စာရွက်စာတမ်း ဘာသာစကား'
  },
  chat: {
    welcome: "မင်္ဂလာပါ! ကျွန်ုပ်သည် VeriBot ဖြစ်ပါသည်။ Verilocale API များနှင့် ပတ်သက်၍ ယနေ့ ဘာကူညီပေးရမလဲ?",
    placeholder: "စာရိုက်ပါ...",
    history: "စကားပြော မှတ်တမ်း",
    new_chat: "စကားဝိုင်း အသစ်",
    no_history: "မှတ်တမ်း မရှိသေးပါ",
    powered_by: "Gemini မှ ပံ့ပိုးသည်။ AI သည် အမှားများ ပြုလုပ်နိုင်သည်။",
    error_response: "ယခုအချိန်တွင် knowledge base သို့ ချိတ်ဆက်၍မရပါ။ ကျေးဇူးပြု၍ နောက်မှ ပြန်ကြိုးစားပါ။"
  },
  footer: {
    rights: 'မူပိုင်ခွင့်များ ရယူပြီး။',
    partner: 'Partner Software by',
    desc: "အရှေ့တောင်အာရှ၏ ဒစ်ဂျစ်တယ် စီးပွားရေးအတွက် ယုံကြည်မှု တည်ဆောက်ခြင်း။ လုပ်ငန်းသုံး အဆင့်မီ OCR နှင့် အထောက်အထား အတည်ပြုခြင်း။",
    legal_header: 'ဥပဒေနှင့် လိုက်နာမှု',
    links: {
      api_ref: 'API Reference',
      contact: 'ဆက်သွယ်ရန်'
    },
    legal: {
      privacy: 'ကိုယ်ရေးအချက်အလက် မူဝါဒ',
      terms: 'ဝန်ဆောင်မှု စည်းမျဉ်းများ',
      compliance: 'လိုက်နာမှု'
    }
  }
};