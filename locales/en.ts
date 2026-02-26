
import { Translation } from '../types';

export const en: Translation = {
  common: {
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    save: 'Save Changes',
    cancel: 'Cancel',
    submit: 'Submit',
    edit: 'Edit',
    logout: 'Sign Out',
    dashboard: 'Console',
    api_key: 'API Key',
    copy: 'Copy Result',
    copied: 'Copied!',
    settings: 'Connection Settings',
    admin_portal: 'Admin Portal',
    active: 'Active',
    revoked: 'Revoked',
    suspended: 'Suspended',
    pending: 'Pending',
    month: 'month',
    date: 'Date',
    status: 'Status',
    actions: 'Actions'
  },
  nav: {
    home: 'Home',
    products: 'Products',
    solutions: 'Solutions',
    developers: 'Developers',
    pricing: 'Pricing',
    about: 'About',
    login: 'Login',
    register: 'Get Started',
    profile: 'Account',
    contact: 'Contact Sales'
  },
  auth: {
    login_title: 'Welcome Back',
    login_subtitle: 'Sign in to access your developer console',
    register_title: 'Create Account',
    register_subtitle: 'Start your free trial with 1,000 API calls',
    email_placeholder: 'name@company.com',
    password_placeholder: 'Password',
    name_placeholder: 'Full Name',
    company_placeholder: 'Company Name',
    forgot_password: 'Forgot Password?',
    dont_have_account: "Don't have an account? Sign up",
    already_have_account: 'Already have an account? Sign in',
    social_login: 'Or continue with',
    privacy_agreement: 'By continuing, you agree to our Terms and Privacy Policy.',
    login_as_admin: 'Log in as Admin (Demo)',
    login_failed: 'Invalid email or password',
    register_failed: 'Registration failed. Email might be in use.'
  },
  console: {
    overview: 'Overview',
    credentials: 'API Credentials',
    usage: 'Usage & Limits',
    logs: 'API Logs',
    billing: 'Billing',
    team: 'Team Members',
    settings: 'Account Settings',
    integration: 'Integration',
    webhooks: 'Webhooks',
    create_key: 'Create New Key',
    revoke: 'Revoke',
    total_requests: 'Total Requests',
    error_rate: 'Error Rate',
    recent_activity: 'Recent Activity',
    key_name_placeholder: 'Key Name (e.g., Prod Server)',
    security: 'Security',
    profile: 'Profile',
    preferences: 'Preferences',
    change_password: 'Change Password',
    mfa: 'Multi-Factor Authentication',
    danger_zone: 'Danger Zone',
    delete_account: 'Delete Account',
    scopes: 'API Scopes',
    select_scopes: 'Select permissions for this key',
    ip_whitelist: 'IP Whitelist',
    ip_placeholder: 'e.g. 192.168.1.0/24 (Optional)',
    active_keys: 'Active Keys',
    key_name: 'Key Name',
    token: 'Token',
    created: 'Created',
  },
  profile: {
    title: 'Profile',
    pro_plan: 'Pro Plan',
    no_company: 'No Company',
    key_desc: 'Use this key to authenticate your API requests. Do not share this key.',
    no_key: 'No API Key Found',
    security_overview: 'Security Overview',
    account_protected: 'Account Protected',
    mfa_enabled: 'MFA enabled via Google Auth',
    full_name: 'Full Name',
    company: 'Company',
    change_avatar: 'Change Avatar',
    avatar_help: 'JPG, GIF or PNG. Max size 800K'
  },
  settings: {
    current_password: 'Current Password',
    new_password: 'New Password',
    update_password: 'Update Password',
    mfa_title: 'Two-factor authentication',
    mfa_desc: 'Add an extra layer of security to your account.',
    danger_desc: 'Once you delete your account, there is no going back. Please be certain.',
    dark_mode: 'Dark Mode',
    dark_mode_desc: 'Toggle dark theme for the console.',
    switch_light: 'Switch to Light',
    switch_dark: 'Switch to Dark',
    language: 'Language',
    language_desc: 'Select your preferred interface language.'
  },
  billing: {
    current_plan: 'Current Plan',
    upgrade: 'Upgrade Plan',
    payment_method: 'Payment Method',
    invoices: 'Invoice History',
    usage_limit: 'Usage Limit',
    next_invoice: 'Next Invoice',
    plan: 'Plan',
    cancel_sub: 'Cancel Subscription',
    update_card: 'Update Card',
    invoice_id: 'Invoice ID',
    amount: 'Amount',
    download: 'Download',
    expires: 'Expires',
  },
  team: {
    invite_member: 'Invite Member',
    role: 'Role',
    status: 'Status',
    actions: 'Actions',
    invite_placeholder: 'colleague@company.com',
    remove_member: 'Remove Member'
  },
  oauth: {
    title: 'OAuth Clients',
    subtitle: 'Manage your OAuth 2.0 clients for secure server-to-server integration.',
    create_client: 'Register Client',
    client_name: 'Client Name',
    client_id: 'Client ID',
    scopes: 'Scopes',
    redirect_uri: 'Redirect URI',
    create_desc: 'Register a new application to obtain Client Credentials.',
    secret_warning: 'This client secret will only be displayed once. Store it securely.',
    description: 'Description'
  },
  admin: {
    dashboard: 'Dashboard',
    users: 'User Management',
    organizations: 'Organizations',
    plans: 'Plan Management',
    system: 'System Health',
    audit: 'Audit Logs',
    monitor: 'System Monitor',
    total_users: 'Total Users',
    active_keys: 'Active API Keys',
    system_health: 'System Health',
    suspend: 'Suspend',
    activate: 'Activate',
    user_management: 'User Management',
    org_management: 'Organization Management',
    search_placeholder: 'Search users or orgs...',
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
    title: 'Deeply Localized AI E-KYC for Southeast Asia',
    subtitle: 'Enterprise-grade stability with 99.9% accuracy. Optimized for Thai & SEA verification scenarios.',
    cta_primary: 'View Demo',
    cta_secondary: 'View Documentation',
  },
  home_stats: {
    yield_label: 'First Pass Yield',
    cost_label: 'Cost Reduction',
    docs_label: 'SEA Document Types'
  },
  features: {
    title: 'Core Capabilities',
    ocr_title: 'Intelligent OCR',
    ocr_desc: 'Adapts to low quality, glare, and complex layouts. Specialized for SEA scripts.',
    liveness_title: 'Passive Liveness',
    liveness_desc: 'Banking-grade anti-spoofing. Silent check + micro-motion detection.',
    face_title: 'Face Recognition',
    face_desc: 'Optimized for Southeast Asian facial characteristics with high throughput.',
  },
  products: {
    title: 'Product Modules',
    subtitle: 'Comprehensive AI capabilities available via API & SDK',
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
      id_npwp_ocr: 'Tax ID (NPWP) OCR',
      th_vat_ocr: 'Tax documents OCR',
      liveness_silent: 'Silent Liveness',
      liveness_video: 'Video Liveness',
      face_detection: 'Face Detection',
      face_compare: 'Face Comparison (1:1)',
      face_search: 'Face Search (1:N)',
    },
    buttons: {
      api_docs: 'API Documentation',
      live_demo: 'Try Live Demo'
    },
    demo_labels: {
      ocr: 'Document Analysis',
      liveness: 'Anti-Spoofing',
      face: 'Biometric Match'
    }
  },
  solutions: {
    title: 'Built for Scale',
    subtitle: "Solving specific verification challenges across Southeast Asia's fastest growing sectors.",
    industries: {
      banking: {
        title: "Banking & Finance",
        desc: "Prevent identity fraud and synthetic ID attacks. Streamline account opening with < 2 min TAT.",
        kpis: ["-78% Audit Costs", "+52% Conversion"]
      },
      insurance: {
        title: "Insurance & Healthcare",
        desc: "Digital onboarding for policyholders. Verify patients remotely for telemedicine.",
        kpis: ["100% Compliant", "Zero Friction"]
      },
      government: {
        title: "Government & Public",
        desc: "Secure access to citizen services. Handle peak loads during subsidy disbursements.",
        kpis: ["On-Prem Ready", "Nation-Scale"]
      },
      commerce: {
        title: "Digital Commerce",
        desc: "Trust architecture for marketplaces. Verify sellers and high-value buyers.",
        kpis: ["Real-time", "Anti-Fraud"]
      },
      mobility: {
        title: "Mobility & Logistics",
        desc: "Driver verification for ride-hailing. Instant license OCR for rentals.",
        kpis: ["Driver Safety", "Fast Check-in"]
      },
      telecom: {
        title: "Telecom",
        desc: "SIM registration compliance (NBTC/Kominfo). Store-front and remote activation.",
        kpis: ["RegTech", "Omnichannel"]
      },
    },
    case_study: {
      title: 'Success Story',
      subtitle: 'How a Leading Thai HR Platform reduced onboarding time by 90%',
      desc: "By integrating Verilocale's ID OCR and Liveness detection, the platform eliminated manual document checks for 50,000+ gig economy workers monthly.",
      cta: 'Read Case Study'
    }
  },
  playground: {
    title: 'Multi-Modal Workbench',
    subtitle: 'Test our AI models with Image, Video, and Comparison capabilities.',
    select_capability: 'Select Capability',
    upload_text: 'Drop image here or click to upload',
    analyzing: 'Processing...',
    results: 'Analysis Results',
    json_view: 'JSON',
    raw_view: 'Raw',
    config_title: 'API Configuration',
    base_url: 'Base URL',
    token: 'Bearer Token',
    run_analysis: 'Run Analysis',
    select_key: 'Select API Key',
    no_keys: 'No active keys found',
    create_key_prompt: 'Create a key in Console',
    ocr_language: 'Document Language'
  },
  chat: {
    welcome: "Hello! I am VeriBot. How can I assist you with Verilocale APIs today?",
    placeholder: "Type a message...",
    history: "Conversation History",
    new_chat: "New Chat",
    no_history: "No history yet",
    powered_by: "Powered by Gemini. AI can make mistakes.",
    error_response: "I'm having trouble connecting to the knowledge base right now. Please try again later."
  },
  footer: {
    rights: 'All rights reserved.',
    partner: 'Partner Software by',
    desc: "Engineering trust for Southeast Asia's digital economy. Enterprise-grade OCR and Identity Verification.",
    legal_header: 'Legal & Compliance',
    links: {
      api_ref: 'API Reference',
      contact: 'Contact Us'
    },
    legal: {
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      compliance: 'Compliance'
    }
  }
};
