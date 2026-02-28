
import { Translation } from '../types';

export const vi: Translation = {
  common: {
    loading: 'Đang tải...',
    success: 'Thành công',
    error: 'Lỗi',
    save: 'Lưu thay đổi',
    cancel: 'Hủy',
    submit: 'Gửi',
    edit: 'Chỉnh sửa',
    logout: 'Đăng xuất',
    dashboard: 'Bảng điều khiển',
    api_key: 'Khóa API',
    copy: 'Sao chép',
    copied: 'Đã sao chép!',
    settings: 'Cài đặt kết nối',
    admin_portal: 'Cổng quản trị',
    active: 'Đang hoạt động',
    revoked: 'Đã thu hồi',
    suspended: 'Bị đình chỉ',
    pending: 'Đang chờ',
    month: 'tháng',
    date: 'Ngày',
    status: 'Trạng thái',
    actions: 'Hành động'
  },
  nav: {
    home: 'Trang chủ',
    products: 'Sản phẩm',
    solutions: 'Giải pháp',
    developers: 'Nhà phát triển',
    pricing: 'Bảng giá',
    about: 'Giới thiệu',
    login: 'Đăng nhập',
    register: 'Đăng ký',
    profile: 'Tài khoản',
    contact: 'Liên hệ'
  },
  auth: {
    login_title: 'Chào mừng trở lại',
    login_subtitle: 'Đăng nhập để truy cập bảng điều khiển nhà phát triển',
    register_title: 'Tạo tài khoản',
    register_subtitle: 'Bắt đầu dùng thử miễn phí với 1.000 cuộc gọi API',
    email_placeholder: 'name@company.com',
    password_placeholder: 'Mật khẩu',
    name_placeholder: 'Họ và tên',
    company_placeholder: 'Tên công ty',
    forgot_password: 'Quên mật khẩu?',
    dont_have_account: "Chưa có tài khoản? Đăng ký",
    already_have_account: 'Đã có tài khoản? Đăng nhập',
    social_login: 'Hoặc tiếp tục với',
    privacy_agreement: 'Bằng cách tiếp tục, bạn đồng ý với Điều khoản và Chính sách quyền riêng tư của chúng tôi.',
    login_as_admin: 'Đăng nhập với tư cách Quản trị viên (Demo)',
    login_failed: 'Email hoặc mật khẩu không hợp lệ',
    register_failed: 'Đăng ký không thành công. Email có thể đã được sử dụng.'
  },
  console: {
    overview: 'Tổng quan',
    credentials: 'Thông tin xác thực API',
    usage: 'Sử dụng & Giới hạn',
    logs: 'Nhật ký API',
    billing: 'Thanh toán',
    team: 'Thành viên nhóm',
    settings: 'Cài đặt tài khoản',
    integration: 'Tích hợp',
    webhooks: 'Webhooks',
    create_key: 'Tạo khóa mới',
    revoke: 'Thu hồi',
    total_requests: 'Tổng số yêu cầu',
    error_rate: 'Tỷ lệ lỗi',
    recent_activity: 'Hoạt động gần đây',
    key_name_placeholder: 'Tên khóa (ví dụ: Prod Server)',
    security: 'Bảo mật',
    profile: 'Hồ sơ',
    preferences: 'Tùy chọn',
    change_password: 'Đổi mật khẩu',
    mfa: 'Xác thực đa yếu tố',
    danger_zone: 'Vùng nguy hiểm',
    delete_account: 'Xóa tài khoản',
    scopes: 'Phạm vi API',
    select_scopes: 'Chọn quyền cho khóa này',
    ip_whitelist: 'Danh sách trắng IP',
    ip_placeholder: 'ví dụ: 192.168.1.0/24 (Tùy chọn)',
    active_keys: 'Khóa đang hoạt động',
    key_name: 'Tên khóa',
    token: 'Mã thông báo',
    created: 'Đã tạo',
  },
  profile: {
    title: 'Hồ sơ',
    pro_plan: 'Gói Pro',
    no_company: 'Không có công ty',
    key_desc: 'Sử dụng khóa này để xác thực các yêu cầu API của bạn. Không chia sẻ khóa này.',
    no_key: 'Không tìm thấy khóa API',
    security_overview: 'Tổng quan bảo mật',
    account_protected: 'Tài khoản được bảo vệ',
    mfa_enabled: 'MFA được kích hoạt qua Google Auth',
    full_name: 'Họ và tên',
    company: 'Công ty',
    change_avatar: 'Đổi ảnh đại diện',
    avatar_help: 'JPG, GIF hoặc PNG. Kích thước tối đa 800K'
  },
  settings: {
    current_password: 'Mật khẩu hiện tại',
    new_password: 'Mật khẩu mới',
    update_password: 'Cập nhật mật khẩu',
    mfa_title: 'Xác thực hai yếu tố',
    mfa_desc: 'Thêm một lớp bảo mật bổ sung cho tài khoản của bạn.',
    danger_desc: 'Khi bạn xóa tài khoản, không thể khôi phục lại. Vui lòng chắc chắn.',
    dark_mode: 'Chế độ tối',
    dark_mode_desc: 'Chuyển đổi giao diện tối cho bảng điều khiển.',
    switch_light: 'Chuyển sang Sáng',
    switch_dark: 'Chuyển sang Tối',
    language: 'Ngôn ngữ',
    language_desc: 'Chọn ngôn ngữ giao diện ưa thích của bạn.'
  },
  billing: {
    current_plan: 'Gói hiện tại',
    upgrade: 'Nâng cấp gói',
    payment_method: 'Phương thức thanh toán',
    invoices: 'Lịch sử hóa đơn',
    usage_limit: 'Giới hạn sử dụng',
    next_invoice: 'Hóa đơn tiếp theo',
    plan: 'Gói',
    cancel_sub: 'Hủy đăng ký',
    update_card: 'Cập nhật thẻ',
    invoice_id: 'ID hóa đơn',
    amount: 'Số tiền',
    download: 'Tải xuống',
    expires: 'Hết hạn',
  },
  team: {
    invite_member: 'Mời thành viên',
    role: 'Vai trò',
    status: 'Trạng thái',
    actions: 'Hành động',
    invite_placeholder: 'dongnghiep@company.com',
    remove_member: 'Xóa thành viên'
  },
  oauth: {
    title: 'OAuth Clients',
    subtitle: 'Quản lý OAuth 2.0 clients để tích hợp máy chủ đến máy chủ an toàn.',
    create_client: 'Đăng ký Client',
    client_name: 'Tên Client',
    client_id: 'Client ID',
    scopes: 'Phạm vi',
    redirect_uri: 'URI chuyển hướng',
    create_desc: 'Đăng ký ứng dụng mới để lấy thông tin xác thực Client.',
    secret_warning: 'Client Secret này sẽ chỉ hiển thị một lần. Hãy lưu trữ an toàn.',
    description: 'Mô tả'
  },
  admin: {
    dashboard: 'Bảng điều khiển',
    users: 'Quản lý người dùng',
    organizations: 'Tổ chức',
    plans: 'Quản lý gói',
    system: 'Sức khỏe hệ thống',
    audit: 'Nhật ký kiểm toán',
    monitor: 'Giám sát hệ thống',
    total_users: 'Tổng số người dùng',
    active_keys: 'Khóa API hoạt động',
    system_health: 'Sức khỏe hệ thống',
    suspend: 'Đình chỉ',
    activate: 'Kích hoạt',
    user_management: 'Quản lý người dùng',
    org_management: 'Quản lý tổ chức',
    search_placeholder: 'Tìm kiếm người dùng hoặc tổ chức...',
    live_traffic: 'Lưu lượng trực tiếp (Mô phỏng)',
    system_logs: 'Nhật ký hệ thống',
    columns: {
      user: 'Người dùng',
      role: 'Vai trò',
      org: 'Tổ chức',
      status: 'Trạng thái',
      plan: 'Gói',
      members: 'Thành viên',
      usage: 'Sử dụng',
      created: 'Đã tạo',
      timestamp: 'Dấu thời gian',
      target: 'Mục tiêu',
      action: 'Hành động',
      ip: 'Địa chỉ IP'
    },
    monitor_tabs: {
      overview: 'Tổng quan',
      business: 'Chỉ số kinh doanh',
      security: 'Bảo mật'
    }
  },
  hero: {
    title: 'AI E-KYC được bản địa hóa sâu sắc cho Đông Nam Á',
    subtitle: 'Ổn định cấp doanh nghiệp với độ chính xác 99.9%. Tối ưu hóa cho các kịch bản xác minh tại Thái Lan & ĐNÁ.',
    cta_primary: 'Xem Demo',
    cta_secondary: 'Xem Tài liệu',
  },
  home_stats: {
    yield_label: 'Tỷ lệ đạt lần đầu',
    cost_label: 'Giảm chi phí',
    docs_label: 'Loại tài liệu ĐNÁ'
  },
  features: {
    title: 'Khả năng cốt lõi',
    ocr_title: 'OCR thông minh',
    ocr_desc: 'Thích ứng với chất lượng thấp, chói sáng và bố cục phức tạp. Chuyên biệt cho các chữ viết ĐNÁ.',
    liveness_title: 'Phát hiện sự sống thụ động',
    liveness_desc: 'Chống giả mạo cấp ngân hàng. Kiểm tra im lặng + phát hiện chuyển động vi mô.',
    face_title: 'Nhận diện khuôn mặt',
    face_desc: 'Tối ưu hóa cho các đặc điểm khuôn mặt Đông Nam Á với thông lượng cao.',
  },
  products: {
    title: 'Mô-đun sản phẩm',
    subtitle: 'Khả năng AI toàn diện có sẵn qua API & SDK',
    categories: {
      ocr: 'Mô-đun OCR',
      liveness: 'Mô-đun sự sống',
      face: 'Mô-đun nhận diện khuôn mặt'
    },
    items: {
      custom_template_ocr: 'OCR mẫu tùy chỉnh',
      id_quality_check: 'Kiểm tra chất lượng ID',
      id_card_ocr: 'Nhận dạng thẻ ID',
      driver_license_ocr: 'OCR bằng lái xe',
      vehicle_license_ocr: 'OCR giấy phép xe',
      bank_card_ocr: 'OCR thẻ ngân hàng',
      business_license_ocr: 'OCR giấy phép kinh doanh',
      general_ocr: 'Nhận dạng văn bản chung',
      liveness_silent: 'Sự sống im lặng',
      liveness_video: 'Sự sống video',
      action_liveness: 'Action Liveness',
      rgb_liveness: 'RGB Liveness',
      face_detection: 'Phát hiện khuôn mặt',
      face_compare: 'So sánh khuôn mặt (1:1)',
      face_search: 'Tìm kiếm khuôn mặt (1:N)',
    },
    buttons: {
      api_docs: 'Tài liệu API',
      live_demo: 'Thử Demo trực tiếp'
    },
    demo_labels: {
      ocr: 'Phân tích tài liệu',
      liveness: 'Chống giả mạo',
      face: 'Khớp sinh trắc học'
    }
  },
  solutions: {
    title: 'Xây dựng để mở rộng',
    subtitle: "Giải quyết các thách thức xác minh cụ thể trên các lĩnh vực phát triển nhanh nhất Đông Nam Á.",
    industries: {
      banking: {
        title: "Ngân hàng & Tài chính",
        desc: "Ngăn chặn gian lận danh tính và các cuộc tấn công ID tổng hợp. Hợp lý hóa việc mở tài khoản với < 2 phút.",
        kpis: ["-78% Chi phí kiểm toán", "+52% Chuyển đổi"]
      },
      insurance: {
        title: "Bảo hiểm & Y tế",
        desc: "Tiếp nhận kỹ thuật số cho chủ hợp đồng. Xác minh bệnh nhân từ xa cho y tế từ xa.",
        kpis: ["100% Tuân thủ", "Không ma sát"]
      },
      government: {
        title: "Chính phủ & Công cộng",
        desc: "Truy cập an toàn vào các dịch vụ công dân. Xử lý tải cao điểm trong quá trình giải ngân trợ cấp.",
        kpis: ["Sẵn sàng tại chỗ", "Quy mô quốc gia"]
      },
      commerce: {
        title: "Thương mại điện tử",
        desc: "Kiến trúc tin cậy cho các thị trường. Xác minh người bán và người mua giá trị cao.",
        kpis: ["Thời gian thực", "Chống gian lận"]
      },
      mobility: {
        title: "Di động & Logistics",
        desc: "Xác minh tài xế cho gọi xe. OCR giấy phép tức thì cho thuê xe.",
        kpis: ["An toàn tài xế", "Đăng ký nhanh"]
      },
      telecom: {
        title: "Viễn thông",
        desc: "Tuân thủ đăng ký SIM (NBTC/Kominfo). Kích hoạt tại cửa hàng và từ xa.",
        kpis: ["RegTech", "Đa kênh"]
      },
    },
    case_study: {
      title: 'Câu chuyện thành công',
      subtitle: 'Cách một nền tảng nhân sự hàng đầu Thái Lan giảm 90% thời gian tiếp nhận',
      desc: "Bằng cách tích hợp ID OCR và phát hiện sự sống của Verilocale, nền tảng đã loại bỏ việc kiểm tra tài liệu thủ công cho hơn 50.000 nhân viên kinh tế gig mỗi tháng.",
      cta: 'Đọc nghiên cứu điển hình'
    }
  },
  playground: {
    title: 'Bàn làm việc đa phương thức',
    subtitle: 'Kiểm tra các mô hình AI của chúng tôi với khả năng Hình ảnh, Video và So sánh.',
    select_capability: 'Chọn khả năng',
    upload_text: 'Thả hình ảnh vào đây hoặc nhấp để tải lên',
    analyzing: 'Đang xử lý...',
    results: 'Kết quả phân tích',
    json_view: 'JSON',
    raw_view: 'Thô',
    config_title: 'Cấu hình API',
    base_url: 'URL cơ sở',
    token: 'Mã thông báo Bearer',
    run_analysis: 'Chạy phân tích',
    select_key: 'Chọn khóa API',
    no_keys: 'Không tìm thấy khóa hoạt động',
    create_key_prompt: 'Tạo khóa trong Bảng điều khiển',
    ocr_language: 'Ngôn ngữ tài liệu'
  },
  chat: {
    welcome: "Xin chào! Tôi là VeriBot. Tôi có thể giúp gì cho bạn với API Verilocale hôm nay?",
    placeholder: "Nhập tin nhắn...",
    history: "Lịch sử trò chuyện",
    new_chat: "Trò chuyện mới",
    no_history: "Chưa có lịch sử",
    powered_by: "Được hỗ trợ bởi Gemini. AI có thể mắc lỗi.",
    error_response: "Tôi đang gặp sự cố khi kết nối với cơ sở kiến thức ngay bây giờ. Vui lòng thử lại sau."
  },
  footer: {
    rights: 'Đã đăng ký bản quyền.',
    partner: 'Phần mềm đối tác bởi',
    desc: "Xây dựng niềm tin cho nền kinh tế kỹ thuật số Đông Nam Á. OCR cấp doanh nghiệp và Xác minh danh tính.",
    legal_header: 'Pháp lý & Tuân thủ',
    links: {
      api_ref: 'Tham khảo API',
      contact: 'Liên hệ với chúng tôi'
    },
    legal: {
      privacy: 'Chính sách quyền riêng tư',
      terms: 'Điều khoản dịch vụ',
      compliance: 'Tuân thủ'
    }
  }
};