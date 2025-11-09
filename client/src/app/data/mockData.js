// Mock data for Brain Stem English Center admin dashboard
// Based on database schema: NhanVien, ChienDich, KenhTruyenThong, HocVienTiemNang, HocVien, DoanhThu
export const mockData = {
  // Statistics data
  statistics: {
    totalRevenue: 250000000,
    totalStudents: 1250,
    totalTeachers: 45,
    totalCourses: 25,
    totalCampaigns: 8,
    totalPotentialStudents: 350,
    revenueData: [
      { date: '2024-01-01', revenue: 2500000, enrollments: 15 },
      { date: '2024-01-02', revenue: 3000000, enrollments: 18 },
      { date: '2024-01-03', revenue: 3500000, enrollments: 21 },
      { date: '2024-01-04', revenue: 4000000, enrollments: 24 },
      { date: '2024-01-05', revenue: 4500000, enrollments: 27 },
      { date: '2024-01-06', revenue: 3800000, enrollments: 23 },
      { date: '2024-01-07', revenue: 4200000, enrollments: 25 },
      { date: '2024-01-08', revenue: 4800000, enrollments: 29 },
      { date: '2024-01-09', revenue: 4600000, enrollments: 28 },
      { date: '2024-01-10', revenue: 5000000, enrollments: 30 },
      { date: '2024-01-11', revenue: 4400000, enrollments: 26 },
      { date: '2024-01-12', revenue: 5200000, enrollments: 31 },
      { date: '2024-01-13', revenue: 5600000, enrollments: 34 },
      { date: '2024-01-14', revenue: 5400000, enrollments: 32 },
      { date: '2024-01-15', revenue: 5800000, enrollments: 35 },
      { date: '2024-01-16', revenue: 6200000, enrollments: 37 },
      { date: '2024-01-17', revenue: 6000000, enrollments: 36 },
      { date: '2024-01-18', revenue: 6400000, enrollments: 38 },
      { date: '2024-01-19', revenue: 6600000, enrollments: 40 },
      { date: '2024-01-20', revenue: 7000000, enrollments: 42 },
      { date: '2024-01-21', revenue: 6800000, enrollments: 41 },
      { date: '2024-01-22', revenue: 7200000, enrollments: 43 },
      { date: '2024-01-23', revenue: 7600000, enrollments: 46 },
      { date: '2024-01-24', revenue: 7400000, enrollments: 44 },
      { date: '2024-01-25', revenue: 7800000, enrollments: 47 },
      { date: '2024-01-26', revenue: 8200000, enrollments: 49 },
      { date: '2024-01-27', revenue: 8000000, enrollments: 48 },
      { date: '2024-01-28', revenue: 8400000, enrollments: 50 },
      { date: '2024-01-29', revenue: 8800000, enrollments: 53 },
      { date: '2024-01-30', revenue: 8600000, enrollments: 52 }
    ],
    topCourses: [
      { id: 1, name: 'IELTS Foundation', enrollments: 150, revenue: 45000000 },
      { id: 2, name: 'TOEIC Intensive', enrollments: 120, revenue: 36000000 },
      { id: 3, name: 'Speaking Club', enrollments: 100, revenue: 20000000 },
      { id: 4, name: 'Grammar Master', enrollments: 80, revenue: 16000000 },
      { id: 5, name: 'Business English', enrollments: 60, revenue: 18000000 }
    ]
  },

  // NhanVien data (Nhân viên)
  nhanVien: [
    {
      MaNV: 1,
      HoTen: 'Đặng Văn Giang',
      ChucVu: 'Giáo viên chính',
      Email: 'dangvangiang@brainstem.edu.vn',
      SDT: '0123456789',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      MaNV: 2,
      HoTen: 'Sarah Johnson',
      ChucVu: 'Giáo viên bản ngữ',
      Email: 'sarah.johnson@brainstem.edu.vn',
      SDT: '0987654321',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      MaNV: 3,
      HoTen: 'Nguyễn Thị Lan',
      ChucVu: 'Trợ giảng',
      Email: 'nguyenthilan@brainstem.edu.vn',
      SDT: '0369852147',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      MaNV: 4,
      HoTen: 'Trần Văn Minh',
      ChucVu: 'Nhân viên tư vấn',
      Email: 'tranvanminh@brainstem.edu.vn',
      SDT: '0741852963',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      MaNV: 5,
      HoTen: 'Phạm Thị Hoa',
      ChucVu: 'Nhân viên marketing',
      Email: 'phamthihoa@brainstem.edu.vn',
      SDT: '0527419638',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      MaNV: 6,
      HoTen: 'Lê Văn Tuấn',
      ChucVu: 'Bảo vệ',
      Email: 'levantuan@brainstem.edu.vn',
      SDT: '0963258741',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ],

  // HocVien data (Học viên)
  users: [
    {
      MaHV: 1,
      HoTen: 'Nguyễn Văn An',
      NgaySinh: '1995-03-15',
      GioiTinh: 'Nam',
      Email: 'nguyenvanan@email.com',
      SDT: '0123456789',
      NgayDangKy: '2024-01-15T10:30:00Z',
      TrangThai: 'ACTIVE',
      MaCD: 1,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      MaHV: 2,
      HoTen: 'Trần Thị Bình',
      NgaySinh: '1998-07-22',
      GioiTinh: 'Nữ',
      Email: 'tranthibinh@email.com',
      SDT: '0987654321',
      NgayDangKy: '2024-01-16T14:20:00Z',
      TrangThai: 'ACTIVE',
      MaCD: 2,
      createdAt: '2024-01-16T14:20:00Z',
      updatedAt: '2024-01-16T14:20:00Z'
    },
    {
      MaHV: 3,
      HoTen: 'Lê Văn Cường',
      NgaySinh: '1992-11-08',
      GioiTinh: 'Nam',
      Email: 'levancuong@email.com',
      SDT: '0369852147',
      NgayDangKy: '2024-01-10T09:15:00Z',
      TrangThai: 'ACTIVE',
      MaCD: 1,
      createdAt: '2024-01-10T09:15:00Z',
      updatedAt: '2024-01-10T09:15:00Z'
    },
    {
      MaHV: 4,
      HoTen: 'Phạm Thị Dung',
      NgaySinh: '1996-05-12',
      GioiTinh: 'Nữ',
      Email: 'phamthidung@email.com',
      SDT: '0741852963',
      NgayDangKy: '2024-01-12T16:45:00Z',
      TrangThai: 'ACTIVE',
      MaCD: 3,
      createdAt: '2024-01-12T16:45:00Z',
      updatedAt: '2024-01-12T16:45:00Z'
    },
    {
      MaHV: 5,
      HoTen: 'Hoàng Văn Em',
      NgaySinh: '2000-09-30',
      GioiTinh: 'Nam',
      Email: 'hoangvanem@email.com',
      SDT: '0527419638',
      NgayDangKy: '2024-01-18T11:30:00Z',
      TrangThai: 'INACTIVE',
      MaCD: 2,
      createdAt: '2024-01-18T11:30:00Z',
      updatedAt: '2024-01-20T08:15:00Z'
    },
    {
      MaHV: 6,
      HoTen: 'Vũ Thị Phương',
      NgaySinh: '1997-12-03',
      GioiTinh: 'Nữ',
      Email: 'vuthiphuong@email.com',
      SDT: '0963258741',
      NgayDangKy: '2024-01-20T13:20:00Z',
      TrangThai: 'ACTIVE',
      MaCD: 1,
      createdAt: '2024-01-20T13:20:00Z',
      updatedAt: '2024-01-20T13:20:00Z'
    },
    {
      MaHV: 7,
      HoTen: 'Bùi Thị Hoa',
      NgaySinh: '1994-04-18',
      GioiTinh: 'Nữ',
      Email: 'buithihoa@email.com',
      SDT: '0852963147',
      NgayDangKy: '2024-01-22T15:10:00Z',
      TrangThai: 'ACTIVE',
      MaCD: 3,
      createdAt: '2024-01-22T15:10:00Z',
      updatedAt: '2024-01-22T15:10:00Z'
    }
  ],

  // HocVienTiemNang data (Học viên tiềm năng)
  hocVienTiemNang: [
    {
      MaHVTN: 1,
      HoTen: 'Nguyễn Thị Mai',
      NgaySinh: '1999-06-14',
      GioiTinh: 'Nữ',
      Email: 'nguyenthimai@email.com',
      SDT: '0123456789',
      NgayDangKy: '2024-01-25T10:30:00Z',
      TrangThai: 'INTERESTED',
      MaCD: 1,
      createdAt: '2024-01-25T10:30:00Z',
      updatedAt: '2024-01-25T10:30:00Z'
    },
    {
      MaHVTN: 2,
      HoTen: 'Trần Văn Nam',
      NgaySinh: '2001-08-20',
      GioiTinh: 'Nam',
      Email: 'tranvannam@email.com',
      SDT: '0987654321',
      NgayDangKy: '2024-01-26T14:20:00Z',
      TrangThai: 'CONTACTED',
      MaCD: 2,
      createdAt: '2024-01-26T14:20:00Z',
      updatedAt: '2024-01-26T14:20:00Z'
    },
    {
      MaHVTN: 3,
      HoTen: 'Lê Thị Hương',
      NgaySinh: '1998-03-10',
      GioiTinh: 'Nữ',
      Email: 'lethihuong@email.com',
      SDT: '0369852147',
      NgayDangKy: '2024-01-27T09:15:00Z',
      TrangThai: 'FOLLOW_UP',
      MaCD: 1,
      createdAt: '2024-01-27T09:15:00Z',
      updatedAt: '2024-01-27T09:15:00Z'
    },
    {
      MaHVTN: 4,
      HoTen: 'Phạm Văn Đức',
      NgaySinh: '1996-11-25',
      GioiTinh: 'Nam',
      Email: 'phamvanduc@email.com',
      SDT: '0741852963',
      NgayDangKy: '2024-01-28T16:45:00Z',
      TrangThai: 'INTERESTED',
      MaCD: 3,
      createdAt: '2024-01-28T16:45:00Z',
      updatedAt: '2024-01-28T16:45:00Z'
    },
    {
      MaHVTN: 5,
      HoTen: 'Hoàng Thị Linh',
      NgaySinh: '2002-01-05',
      GioiTinh: 'Nữ',
      Email: 'hoangthilinh@email.com',
      SDT: '0527419638',
      NgayDangKy: '2024-01-29T11:30:00Z',
      TrangThai: 'CONTACTED',
      MaCD: 2,
      createdAt: '2024-01-29T11:30:00Z',
      updatedAt: '2024-01-29T11:30:00Z'
    }
  ],

  // HV Tiềm năng data (Học viên tiềm năng)
  categories: [
    {
      id: 1,
      name: 'Học viên xuất sắc',
      description: 'Những học viên có thành tích học tập tốt nhất',
      state: 'ACTIVE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Học viên tiềm năng',
      description: 'Những học viên có khả năng phát triển tốt',
      state: 'ACTIVE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      name: 'Học viên cần hỗ trợ',
      description: 'Những học viên cần được quan tâm đặc biệt',
      state: 'ACTIVE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 4,
      name: 'Học viên mới',
      description: 'Những học viên vừa đăng ký khóa học',
      state: 'ACTIVE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 5,
      name: 'Học viên VIP',
      description: 'Những học viên đặc biệt quan trọng',
      state: 'ACTIVE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 6,
      name: 'Học viên tạm nghỉ',
      description: 'Những học viên tạm thời nghỉ học',
      state: 'INACTIVE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    }
  ],

  // QL nhân viên data (Quản lý nhân viên)
  foods: [
    {
      id: 1,
      name: 'Đặng Văn Giang',
      description: 'Giáo viên IELTS với 5 năm kinh nghiệm',
      price: 15000000,
      imgUrl: '/img/teacher-giang.jpg',
      categoryId: 1,
      categoryName: 'Giáo viên chính',
      state: 'AVAILABLE',
      quantity: 1,
      duration: 'Full-time',
      level: 'Senior',
      specialization: 'IELTS, TOEFL',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      description: 'Giáo viên bản ngữ chuyên Speaking',
      price: 20000000,
      imgUrl: '/img/teacher-sarah.jpg',
      categoryId: 1,
      categoryName: 'Giáo viên chính',
      state: 'AVAILABLE',
      quantity: 1,
      duration: 'Full-time',
      level: 'Expert',
      specialization: 'Speaking, Pronunciation',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      name: 'Michael Brown',
      description: 'Giáo viên TOEIC chuyên nghiệp',
      price: 12000000,
      imgUrl: '/img/teacher-michael.jpg',
      categoryId: 2,
      categoryName: 'Giáo viên phụ',
      state: 'AVAILABLE',
      quantity: 1,
      duration: 'Part-time',
      level: 'Intermediate',
      specialization: 'TOEIC, Business English',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 4,
      name: 'Nguyễn Thị Lan',
      description: 'Trợ giảng và hỗ trợ học viên',
      price: 8000000,
      imgUrl: '/img/teacher-lan.jpg',
      categoryId: 3,
      categoryName: 'Trợ giảng',
      state: 'AVAILABLE',
      quantity: 1,
      duration: 'Part-time',
      level: 'Junior',
      specialization: 'Grammar, Writing',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 5,
      name: 'Trần Văn Minh',
      description: 'Nhân viên tư vấn và hỗ trợ',
      price: 6000000,
      imgUrl: '/img/staff-minh.jpg',
      categoryId: 4,
      categoryName: 'Nhân viên hỗ trợ',
      state: 'AVAILABLE',
      quantity: 1,
      duration: 'Full-time',
      level: 'Junior',
      specialization: 'Customer Service',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 6,
      name: 'Phạm Thị Hoa',
      description: 'Nhân viên marketing và truyền thông',
      price: 10000000,
      imgUrl: '/img/staff-hoa.jpg',
      categoryId: 5,
      categoryName: 'Nhân viên marketing',
      state: 'AVAILABLE',
      quantity: 1,
      duration: 'Full-time',
      level: 'Intermediate',
      specialization: 'Marketing, Social Media',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 7,
      name: 'Lê Văn Tuấn',
      description: 'Nhân viên bảo vệ và an ninh',
      price: 5000000,
      imgUrl: '/img/security-tuan.jpg',
      categoryId: 6,
      categoryName: 'Bảo vệ',
      state: 'UNAVAILABLE',
      quantity: 0,
      duration: 'Full-time',
      level: 'Junior',
      specialization: 'Security',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z'
    }
  ],

  // Forms data (Quản lý Form)
  forms: [
    {
      MaForm: 1,
      TenForm: 'Form Đăng ký IELTS Foundation',
      MoTa: 'Form đăng ký khóa học IELTS Foundation cho chiến dịch mùa hè 2024',
      MaChienDich: 1,
      TrangThai: 'ACTIVE',
      CacTruong: [
        { tenTruong: 'Họ tên', loaiTruong: 'text', batBuoc: true, placeholder: 'Nhập họ tên đầy đủ' },
        { tenTruong: 'Email', loaiTruong: 'email', batBuoc: true, placeholder: 'Nhập địa chỉ email' },
        { tenTruong: 'Số điện thoại', loaiTruong: 'tel', batBuoc: true, placeholder: 'Nhập số điện thoại' },
        { tenTruong: 'Ngày sinh', loaiTruong: 'date', batBuoc: true, placeholder: '' },
        { tenTruong: 'Trình độ hiện tại', loaiTruong: 'select', batBuoc: true, placeholder: 'Chọn trình độ', options: ['Beginner', 'Elementary', 'Intermediate', 'Upper-Intermediate'] },
        { tenTruong: 'Mục tiêu điểm số', loaiTruong: 'number', batBuoc: false, placeholder: 'Nhập điểm số mong muốn' }
      ],
      CauHinh: {
        mauSac: '#5d57c9',
        kichThuoc: 'large',
        hienThiTieuDe: true,
        hienThiMoTa: true,
        nutSubmit: 'Đăng ký ngay',
        nutReset: 'Làm lại'
      },
      EmbedCode: '<iframe src="https://brainstem.edu.vn/forms/1" width="100%" height="600" frameborder="0"></iframe>',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      MaForm: 2,
      TenForm: 'Form Tư vấn TOEIC',
      MoTa: 'Form tư vấn khóa học TOEIC cho nhân viên văn phòng',
      MaChienDich: 2,
      TrangThai: 'ACTIVE',
      CacTruong: [
        { tenTruong: 'Họ tên', loaiTruong: 'text', batBuoc: true, placeholder: 'Nhập họ tên đầy đủ' },
        { tenTruong: 'Email', loaiTruong: 'email', batBuoc: true, placeholder: 'Nhập địa chỉ email' },
        { tenTruong: 'Số điện thoại', loaiTruong: 'tel', batBuoc: true, placeholder: 'Nhập số điện thoại' },
        { tenTruong: 'Công ty', loaiTruong: 'text', batBuoc: false, placeholder: 'Nhập tên công ty' },
        { tenTruong: 'Chức vụ', loaiTruong: 'text', batBuoc: false, placeholder: 'Nhập chức vụ' },
        { tenTruong: 'Thời gian học mong muốn', loaiTruong: 'select', batBuoc: true, placeholder: 'Chọn thời gian', options: ['Sáng (8h-10h)', 'Chiều (14h-16h)', 'Tối (19h-21h)', 'Cuối tuần'] }
      ],
      CauHinh: {
        mauSac: '#28a745',
        kichThuoc: 'medium',
        hienThiTieuDe: true,
        hienThiMoTa: true,
        nutSubmit: 'Gửi yêu cầu tư vấn',
        nutReset: 'Làm lại'
      },
      EmbedCode: '<iframe src="https://brainstem.edu.vn/forms/2" width="100%" height="500" frameborder="0"></iframe>',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    },
    {
      MaForm: 3,
      TenForm: 'Form Đăng ký Speaking Club',
      MoTa: 'Form đăng ký tham gia câu lạc bộ nói tiếng Anh miễn phí',
      MaChienDich: 3,
      TrangThai: 'ACTIVE',
      CacTruong: [
        { tenTruong: 'Họ tên', loaiTruong: 'text', batBuoc: true, placeholder: 'Nhập họ tên đầy đủ' },
        { tenTruong: 'Email', loaiTruong: 'email', batBuoc: true, placeholder: 'Nhập địa chỉ email' },
        { tenTruong: 'Số điện thoại', loaiTruong: 'tel', batBuoc: true, placeholder: 'Nhập số điện thoại' },
        { tenTruong: 'Trình độ tiếng Anh', loaiTruong: 'select', batBuoc: true, placeholder: 'Chọn trình độ', options: ['Beginner', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced'] },
        { tenTruong: 'Lý do tham gia', loaiTruong: 'textarea', batBuoc: false, placeholder: 'Chia sẻ lý do bạn muốn tham gia Speaking Club' }
      ],
      CauHinh: {
        mauSac: '#ffc107',
        kichThuoc: 'medium',
        hienThiTieuDe: true,
        hienThiMoTa: true,
        nutSubmit: 'Đăng ký tham gia',
        nutReset: 'Làm lại'
      },
      EmbedCode: '<iframe src="https://brainstem.edu.vn/forms/3" width="100%" height="450" frameborder="0"></iframe>',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z'
    },
    {
      MaForm: 4,
      TenForm: 'Form Liên hệ Tổng đài',
      MoTa: 'Form liên hệ tổng đài tư vấn cho khách hàng tiềm năng',
      MaChienDich: 4,
      TrangThai: 'ACTIVE',
      CacTruong: [
        { tenTruong: 'Họ tên', loaiTruong: 'text', batBuoc: true, placeholder: 'Nhập họ tên đầy đủ' },
        { tenTruong: 'Email', loaiTruong: 'email', batBuoc: true, placeholder: 'Nhập địa chỉ email' },
        { tenTruong: 'Số điện thoại', loaiTruong: 'tel', batBuoc: true, placeholder: 'Nhập số điện thoại' },
        { tenTruong: 'Khóa học quan tâm', loaiTruong: 'select', batBuoc: true, placeholder: 'Chọn khóa học', options: ['IELTS', 'TOEIC', 'Speaking Club', 'Grammar Master', 'Business English'] },
        { tenTruong: 'Thời gian gọi lại', loaiTruong: 'select', batBuoc: true, placeholder: 'Chọn thời gian', options: ['Sáng (8h-12h)', 'Chiều (13h-17h)', 'Tối (18h-20h)'] },
        { tenTruong: 'Ghi chú', loaiTruong: 'textarea', batBuoc: false, placeholder: 'Ghi chú thêm (nếu có)' }
      ],
      CauHinh: {
        mauSac: '#dc3545',
        kichThuoc: 'large',
        hienThiTieuDe: true,
        hienThiMoTa: true,
        nutSubmit: 'Gửi yêu cầu gọi lại',
        nutReset: 'Làm lại'
      },
      EmbedCode: '<iframe src="https://brainstem.edu.vn/forms/4" width="100%" height="550" frameborder="0"></iframe>',
      createdAt: '2024-01-04T00:00:00Z',
      updatedAt: '2024-01-04T00:00:00Z'
    }
  ],

  // DoanhThu data (Doanh thu)
  doanhThu: [
    {
      MaHD: 1,
      MaHV: 1,
      MaCD: 1,
      SoTien: 3000000,
      NgayDong: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      MaHD: 2,
      MaHV: 2,
      MaCD: 2,
      SoTien: 2500000,
      NgayDong: '2024-01-16T14:20:00Z',
      createdAt: '2024-01-16T14:20:00Z',
      updatedAt: '2024-01-16T14:20:00Z'
    },
    {
      MaHD: 3,
      MaHV: 3,
      MaCD: 1,
      SoTien: 4500000,
      NgayDong: '2024-01-10T09:15:00Z',
      createdAt: '2024-01-10T09:15:00Z',
      updatedAt: '2024-01-10T09:15:00Z'
    },
    {
      MaHD: 4,
      MaHV: 4,
      MaCD: 3,
      SoTien: 3500000,
      NgayDong: '2024-01-12T16:45:00Z',
      createdAt: '2024-01-12T16:45:00Z',
      updatedAt: '2024-01-12T16:45:00Z'
    },
    {
      MaHD: 5,
      MaHV: 6,
      MaCD: 1,
      SoTien: 2000000,
      NgayDong: '2024-01-20T13:20:00Z',
      createdAt: '2024-01-20T13:20:00Z',
      updatedAt: '2024-01-20T13:20:00Z'
    },
    {
      MaHD: 6,
      MaHV: 7,
      MaCD: 3,
      SoTien: 4000000,
      NgayDong: '2024-01-22T15:10:00Z',
      createdAt: '2024-01-22T15:10:00Z',
      updatedAt: '2024-01-22T15:10:00Z'
    }
  ],

  // Enrollments data
  orders: [
    {
      id: 1,
      orderCode: 'ENR001',
      customerId: 1,
      customerName: 'Nguyễn Văn An',
      customerPhone: '0123456789',
      totalPrice: 3000000,
      orderState: 'PENDING',
      paymentMethod: 'CASH',
      orderTime: '2024-01-25T12:30:00Z',
      createdAt: '2024-01-25T12:30:00Z',
      updatedAt: '2024-01-25T12:30:00Z',
      orderItems: [
        { foodId: 1, foodName: 'IELTS Foundation', quantity: 1, price: 3000000 }
      ]
    },
    {
      id: 2,
      orderCode: 'ENR002',
      customerId: 2,
      customerName: 'Trần Thị Bình',
      customerPhone: '0987654321',
      totalPrice: 1500000,
      orderState: 'CONFIRMED',
      paymentMethod: 'VNPAY',
      orderTime: '2024-01-25T14:15:00Z',
      createdAt: '2024-01-25T14:15:00Z',
      updatedAt: '2024-01-25T14:20:00Z',
      orderItems: [
        { foodId: 4, foodName: 'Speaking Club', quantity: 1, price: 1500000 }
      ]
    },
    {
      id: 3,
      orderCode: 'ENR003',
      customerId: 6,
      customerName: 'Vũ Thị Phương',
      customerPhone: '0963258741',
      totalPrice: 2500000,
      orderState: 'COMPLETED',
      paymentMethod: 'VNPAY',
      orderTime: '2024-01-25T18:45:00Z',
      createdAt: '2024-01-25T18:45:00Z',
      updatedAt: '2024-01-25T19:30:00Z',
      orderItems: [
        { foodId: 3, foodName: 'TOEIC Intensive', quantity: 1, price: 2500000 }
      ]
    },
    {
      id: 4,
      orderCode: 'ENR004',
      customerId: 8,
      customerName: 'Bùi Thị Hoa',
      customerPhone: '0852963147',
      totalPrice: 3500000,
      orderState: 'CANCELLED',
      paymentMethod: 'CASH',
      orderTime: '2024-01-26T11:20:00Z',
      createdAt: '2024-01-26T11:20:00Z',
      updatedAt: '2024-01-26T11:45:00Z',
      orderItems: [
        { foodId: 6, foodName: 'Business English', quantity: 1, price: 3500000 }
      ]
    }
  ],

  // KenhTruyenThong data (Kênh truyền thông)
  kenhTruyenThong: [
    {
      MaKenh: 1,
      TenKenh: 'Facebook',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      MaKenh: 2,
      TenKenh: 'Instagram',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      MaKenh: 3,
      TenKenh: 'YouTube',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      MaKenh: 4,
      TenKenh: 'TikTok',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      MaKenh: 5,
      TenKenh: 'Zalo',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      MaKenh: 6,
      TenKenh: 'Website',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ],

  // Kênh truyền thông data
  tables: [
    {
      id: 1,
      name: 'Facebook',
      state: 'AVAILABLE',
      numberOfChair: 1000,
      capacity: 1000,
      equipment: 'Social Media Platform',
      followers: 5000,
      engagement: 'High',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Instagram',
      state: 'OCCUPIED',
      numberOfChair: 800,
      capacity: 800,
      equipment: 'Visual Content Platform',
      followers: 3000,
      engagement: 'Medium',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-25T12:30:00Z'
    },
    {
      id: 3,
      name: 'YouTube',
      state: 'AVAILABLE',
      numberOfChair: 500,
      capacity: 500,
      equipment: 'Video Content Platform',
      followers: 2000,
      engagement: 'High',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 4,
      name: 'TikTok',
      state: 'RESERVED',
      numberOfChair: 1200,
      capacity: 1200,
      equipment: 'Short Video Platform',
      followers: 4000,
      engagement: 'Very High',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-25T10:00:00Z'
    },
    {
      id: 5,
      name: 'Zalo',
      state: 'MAINTENANCE',
      numberOfChair: 600,
      capacity: 600,
      equipment: 'Messaging Platform',
      followers: 1500,
      engagement: 'Medium',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-24T16:00:00Z'
    },
    {
      id: 6,
      name: 'Website',
      state: 'AVAILABLE',
      numberOfChair: 2000,
      capacity: 2000,
      equipment: 'Official Website',
      followers: 10000,
      engagement: 'High',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ],

  // ChienDich data (Chiến dịch)
  chienDich: [
    {
      MaCD: 1,
      TenCD: 'Chiến dịch Back to School 2024',
      NgayBD: '2024-01-01T00:00:00Z',
      NgayKT: '2024-03-31T23:59:59Z',
      TrangThai: 'ACTIVE',
      MaKenh: 1,
      ChiPhi: 50000000,
      DoanhThu: 150000000,
      LoiNhuan: 100000000,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      MaCD: 2,
      TenCD: 'Chiến dịch Summer Intensive 2024',
      NgayBD: '2024-06-01T00:00:00Z',
      NgayKT: '2024-08-31T23:59:59Z',
      TrangThai: 'ACTIVE',
      MaKenh: 2,
      ChiPhi: 30000000,
      DoanhThu: 120000000,
      LoiNhuan: 90000000,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    {
      MaCD: 3,
      TenCD: 'Chiến dịch IELTS Challenge 2024',
      NgayBD: '2024-01-01T00:00:00Z',
      NgayKT: '2024-12-31T23:59:59Z',
      TrangThai: 'INACTIVE',
      MaKenh: 3,
      ChiPhi: 80000000,
      DoanhThu: 200000000,
      LoiNhuan: 120000000,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z'
    },
    {
      MaCD: 4,
      TenCD: 'Chiến dịch Tết Nguyên Đán 2024',
      NgayBD: '2024-02-01T00:00:00Z',
      NgayKT: '2024-02-29T23:59:59Z',
      TrangThai: 'COMPLETED',
      MaKenh: 4,
      ChiPhi: 20000000,
      DoanhThu: 80000000,
      LoiNhuan: 60000000,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-02-29T23:59:59Z'
    }
  ],

  // QL Chiến dịch data (Quản lý chiến dịch)
  discounts: [
    {
      id: 1,
      name: 'Chiến dịch Back to School',
      description: 'Chiến dịch khuyến mãi cho học viên quay lại học sau kỳ nghỉ',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minOrderValue: 2000000,
      maxDiscountAmount: 500000,
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-03-31T23:59:59Z',
      status: 'ACTIVE',
      usageLimit: 1000,
      usedCount: 45,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Chiến dịch Summer Intensive',
      description: 'Chiến dịch khóa học cấp tốc mùa hè',
      discountType: 'FIXED_AMOUNT',
      discountValue: 300000,
      minOrderValue: 1500000,
      maxDiscountAmount: 300000,
      startDate: '2024-06-01T00:00:00Z',
      endDate: '2024-08-31T23:59:59Z',
      status: 'ACTIVE',
      usageLimit: 500,
      usedCount: 23,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    {
      id: 3,
      name: 'Chiến dịch IELTS Challenge',
      description: 'Chiến dịch thử thách IELTS với học bổng đặc biệt',
      discountType: 'PERCENTAGE',
      discountValue: 25,
      minOrderValue: 3000000,
      maxDiscountAmount: 1000000,
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      status: 'INACTIVE',
      usageLimit: 100,
      usedCount: 12,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z'
    }
  ],

  // Class schedules data
  tableReservations: [
    {
      id: 1,
      email: 'nguyenvanan@email.com',
      fullName: 'Nguyễn Văn An',
      phoneNumber: '0123456789',
      description: 'Lớp IELTS Foundation - Buổi 1',
      periodType: 'MORNING',
      tableId: 1,
      tableName: 'Phòng A101',
      orderTime: '2024-01-26T08:00:00Z',
      orderTableState: 'PENDING',
      course: 'IELTS Foundation',
      teacher: 'Đặng Văn Giang',
      createdAt: '2024-01-25T10:00:00Z',
      updatedAt: '2024-01-25T10:00:00Z'
    },
    {
      id: 2,
      email: 'tranthibinh@email.com',
      fullName: 'Trần Thị Bình',
      phoneNumber: '0987654321',
      description: 'Lớp Speaking Club - Buổi 2',
      periodType: 'AFTERNOON',
      tableId: 2,
      tableName: 'Phòng A102',
      orderTime: '2024-01-26T14:00:00Z',
      orderTableState: 'CONFIRMED',
      course: 'Speaking Club',
      teacher: 'Sarah Johnson',
      createdAt: '2024-01-24T15:30:00Z',
      updatedAt: '2024-01-24T16:00:00Z'
    },
    {
      id: 3,
      email: 'vuthiphuong@email.com',
      fullName: 'Vũ Thị Phương',
      phoneNumber: '0963258741',
      description: 'Lớp TOEIC Intensive - Buổi 3',
      periodType: 'EVENING',
      tableId: 3,
      tableName: 'Phòng B201',
      orderTime: '2024-01-27T18:30:00Z',
      orderTableState: 'COMPLETED',
      course: 'TOEIC Intensive',
      teacher: 'Michael Brown',
      createdAt: '2024-01-23T14:20:00Z',
      updatedAt: '2024-01-27T20:00:00Z'
    }
  ],

  // Logs data
  logs: [
    {
      id: 1,
      action: 'CREATE_USER',
      description: 'Tạo tài khoản người dùng mới: Nguyễn Văn An',
      userId: 3,
      userName: 'Lê Văn Cường',
      timestamp: '2024-01-25T10:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: 2,
      action: 'UPDATE_PRODUCT',
      description: 'Cập nhật thông tin sản phẩm: Phở Bò',
      userId: 4,
      userName: 'Phạm Thị Dung',
      timestamp: '2024-01-25T11:15:00Z',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: 3,
      action: 'DELETE_ORDER',
      description: 'Xóa đơn hàng: ORD004',
      userId: 3,
      userName: 'Lê Văn Cường',
      timestamp: '2024-01-26T11:45:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: 4,
      action: 'CREATE_DISCOUNT',
      description: 'Tạo mã giảm giá mới: Giảm giá 10%',
      userId: 4,
      userName: 'Phạm Thị Dung',
      timestamp: '2024-01-24T09:20:00Z',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: 5,
      action: 'UPDATE_TABLE',
      description: 'Cập nhật trạng thái bàn: Bàn 2 - OCCUPIED',
      userId: 7,
      userName: 'Đặng Văn Giang',
      timestamp: '2024-01-25T12:30:00Z',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  ],

  // Student and marketing management data
  students: [
    {
      id: 1,
      studentCode: 'STU-0001',
      fullName: 'An Nguyen',
      email: 'an.nguyen@example.com',
      phoneNumber: '0901234567',
      status: 'ACTIVE',
      enrollmentStatus: 'ENROLLED',
      courseId: 1,
      courseName: 'IELTS Foundation',
      campaignId: 1,
      channelId: 1,
      assignedStaffId: 2,
      enrollmentDate: '2024-01-05T09:00:00Z',
      graduationDate: null,
      tuitionFee: 3000000,
      paidAmount: 3000000,
      outstandingAmount: 0,
      newStudent: true,
      notes: 'Requested speaking-focused curriculum'
    },
    {
      id: 2,
      studentCode: 'STU-0002',
      fullName: 'Binh Tran',
      email: 'binh.tran@example.com',
      phoneNumber: '0987654321',
      status: 'ACTIVE',
      enrollmentStatus: 'ENROLLED',
      courseId: 4,
      courseName: 'Speaking Club',
      campaignId: 4,
      channelId: 4,
      assignedStaffId: 4,
      enrollmentDate: '2023-12-20T18:00:00Z',
      graduationDate: null,
      tuitionFee: 1500000,
      paidAmount: 1500000,
      outstandingAmount: 0,
      newStudent: false,
      notes: 'Prefers weekend sessions'
    },
    {
      id: 3,
      studentCode: 'STU-0003',
      fullName: 'Phuong Vu',
      email: 'phuong.vu@example.com',
      phoneNumber: '0933221100',
      status: 'ACTIVE',
      enrollmentStatus: 'ENROLLED',
      courseId: 3,
      courseName: 'TOEIC Intensive',
      campaignId: 3,
      channelId: 2,
      assignedStaffId: 3,
      enrollmentDate: '2023-10-10T10:15:00Z',
      graduationDate: '2024-01-15T10:15:00Z',
      tuitionFee: 2500000,
      paidAmount: 2250000,
      outstandingAmount: 250000,
      newStudent: false,
      notes: 'Corporate sponsored'
    },
    {
      id: 4,
      studentCode: 'STU-0004',
      fullName: 'Dung Pham',
      email: 'dung.pham@example.com',
      phoneNumber: '0977001122',
      status: 'ON_HOLD',
      enrollmentStatus: 'PENDING',
      courseId: 2,
      courseName: 'IELTS Advanced',
      campaignId: 1,
      channelId: 1,
      assignedStaffId: 2,
      enrollmentDate: '2024-01-22T09:30:00Z',
      graduationDate: null,
      tuitionFee: 4200000,
      paidAmount: 2000000,
      outstandingAmount: 2200000,
      newStudent: true,
      notes: 'Waiting for payment confirmation'
    },
    {
      id: 5,
      studentCode: 'STU-0005',
      fullName: 'Em Hoang',
      email: 'em.hoang@example.com',
      phoneNumber: '0911888777',
      status: 'GRADUATED',
      enrollmentStatus: 'COMPLETED',
      courseId: 5,
      courseName: 'Business English',
      campaignId: 3,
      channelId: 3,
      assignedStaffId: 1,
      enrollmentDate: '2023-08-01T08:00:00Z',
      graduationDate: '2023-11-30T20:00:00Z',
      tuitionFee: 3500000,
      paidAmount: 3500000,
      outstandingAmount: 0,
      newStudent: false,
      notes: 'Completed with distinction'
    },
    {
      id: 6,
      studentCode: 'STU-0006',
      fullName: 'Giang Duong',
      email: 'giang.duong@example.com',
      phoneNumber: '0909777666',
      status: 'ACTIVE',
      enrollmentStatus: 'ENROLLED',
      courseId: 6,
      courseName: 'Business English',
      campaignId: 2,
      channelId: 1,
      assignedStaffId: 3,
      enrollmentDate: '2024-02-02T14:00:00Z',
      graduationDate: null,
      tuitionFee: 3500000,
      paidAmount: 0,
      outstandingAmount: 3500000,
      newStudent: true,
      notes: 'Lead converted after webinar'
    }
  ],
  potentialStudents: [
    {
      id: 1,
      fullName: 'Linh Pham',
      email: 'linh.pham@example.com',
      phoneNumber: '0905123123',
      status: 'TRIAL',
      interestLevel: 'HIGH',
      channelId: 1,
      campaignId: 1,
      leadSource: 'Facebook Ads',
      tags: ['IELTS', 'Evening'],
      assignedStaffId: 4,
      lastContactAt: '2024-01-20T10:30:00Z',
      convertedStudentId: null,
      createdAt: '2024-01-15T08:30:00Z',
      updatedAt: '2024-01-20T10:30:00Z',
      notes: 'Attended trial class and requested syllabus'
    },
    {
      id: 2,
      fullName: 'Khoa Dang',
      email: 'khoa.dang@example.com',
      phoneNumber: '0933111999',
      status: 'REGISTERED',
      interestLevel: 'HIGH',
      channelId: 2,
      campaignId: 3,
      leadSource: 'Google Ads',
      tags: ['TOEIC', 'Corporate'],
      assignedStaffId: 2,
      lastContactAt: '2023-11-05T09:00:00Z',
      convertedStudentId: 3,
      createdAt: '2023-10-12T07:45:00Z',
      updatedAt: '2023-11-06T11:15:00Z',
      notes: 'Converted through corporate package'
    },
    {
      id: 3,
      fullName: 'Mai Le',
      email: 'mai.le@example.com',
      phoneNumber: '0908345566',
      status: 'NOT_REGISTERED',
      interestLevel: 'LOW',
      channelId: 3,
      campaignId: 4,
      leadSource: 'Email Newsletter',
      tags: ['Speaking'],
      assignedStaffId: 4,
      lastContactAt: '2024-01-12T13:20:00Z',
      convertedStudentId: null,
      createdAt: '2023-12-28T09:15:00Z',
      updatedAt: '2024-01-12T13:20:00Z',
      notes: 'Declined due to schedule conflict'
    },
    {
      id: 4,
      fullName: 'Quyen Vo',
      email: 'quyen.vo@example.com',
      phoneNumber: '0944123987',
      status: 'TRIAL',
      interestLevel: 'MEDIUM',
      channelId: 4,
      campaignId: 2,
      leadSource: 'School Fair',
      tags: ['Kids', 'Parents'],
      assignedStaffId: 3,
      lastContactAt: '2024-02-01T16:00:00Z',
      convertedStudentId: null,
      createdAt: '2024-01-25T10:00:00Z',
      updatedAt: '2024-02-01T16:00:00Z',
      notes: 'Parent requested weekend class info'
    },
    {
      id: 5,
      fullName: 'Son Ho',
      email: 'son.ho@example.com',
      phoneNumber: '0911555222',
      status: 'REGISTERED',
      interestLevel: 'MEDIUM',
      channelId: 1,
      campaignId: 1,
      leadSource: 'Facebook Ads',
      tags: ['IELTS'],
      assignedStaffId: 2,
      lastContactAt: '2024-01-18T17:45:00Z',
      convertedStudentId: 1,
      createdAt: '2024-01-12T11:25:00Z',
      updatedAt: '2024-01-18T17:45:00Z',
      notes: 'Converted after second call'
    },
    {
      id: 6,
      fullName: 'Thanh Nguyen',
      email: 'thanh.nguyen@example.com',
      phoneNumber: '0909444333',
      status: 'NOT_REGISTERED',
      interestLevel: 'MEDIUM',
      channelId: 2,
      campaignId: 1,
      leadSource: 'Google Search',
      tags: ['IELTS', 'Morning'],
      assignedStaffId: 1,
      lastContactAt: '2024-01-24T09:40:00Z',
      convertedStudentId: null,
      createdAt: '2024-01-18T09:40:00Z',
      updatedAt: '2024-01-24T09:40:00Z',
      notes: 'Considering competitor offer'
    }
  ],
  staffMembers: [
    {
      id: 1,
      employeeCode: 'EMP-0001',
      fullName: 'Cuong Le',
      email: 'cuong.le@example.com',
      phoneNumber: '0978111222',
      role: 'MARKETING_MANAGER',
      department: 'Marketing',
      status: 'ACTIVE',
      hiredAt: '2022-06-01T00:00:00Z',
      assignedCampaignIds: [1, 3],
      skills: ['Strategy', 'Analytics', 'Budgeting'],
      kpiScore: 92
    },
    {
      id: 2,
      employeeCode: 'EMP-0002',
      fullName: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phoneNumber: '0966554433',
      role: 'ADMISSIONS_LEAD',
      department: 'Admissions',
      status: 'ACTIVE',
      hiredAt: '2021-09-15T00:00:00Z',
      assignedCampaignIds: [1, 3, 4],
      skills: ['Counseling', 'Follow up', 'Reporting'],
      kpiScore: 88
    },
    {
      id: 3,
      employeeCode: 'EMP-0003',
      fullName: 'Nam Tran',
      email: 'nam.tran@example.com',
      phoneNumber: '0933555777',
      role: 'MARKETING_SPECIALIST',
      department: 'Marketing',
      status: 'ACTIVE',
      hiredAt: '2023-02-10T00:00:00Z',
      assignedCampaignIds: [2, 4],
      skills: ['Content', 'Automation'],
      kpiScore: 81
    },
    {
      id: 4,
      employeeCode: 'EMP-0004',
      fullName: 'Thu Nguyen',
      email: 'thu.nguyen@example.com',
      phoneNumber: '0919666000',
      role: 'SALES_COUNSELOR',
      department: 'Admissions',
      status: 'ACTIVE',
      hiredAt: '2023-05-20T00:00:00Z',
      assignedCampaignIds: [1, 2, 4],
      skills: ['Negotiation', 'Customer care'],
      kpiScore: 85
    },
    {
      id: 5,
      employeeCode: 'EMP-0005',
      fullName: 'Huy Pham',
      email: 'huy.pham@example.com',
      phoneNumber: '0908111000',
      role: 'DATA_ANALYST',
      department: 'Operations',
      status: 'ON_LEAVE',
      hiredAt: '2020-11-01T00:00:00Z',
      assignedCampaignIds: [3],
      skills: ['Data', 'Visualization'],
      kpiScore: 76
    }
  ],
  channels: [
    {
      id: 1,
      name: 'Facebook Ads',
      type: 'PAID',
      status: 'ACTIVE',
      owner: 'Marketing Team',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2024-01-25T12:00:00Z',
      totalCampaigns: 4,
      defaultSortMetric: 'roi',
      summary: {
        spendToDate: 125000000,
        revenueToDate: 380000000,
        leadsToDate: 820,
        newStudentsToDate: 210
      },
      monthlyStats: [
        { month: '2023-11', spend: 18000000, leads: 95, newStudents: 28, revenue: 65000000 },
        { month: '2023-12', spend: 20000000, leads: 105, newStudents: 32, revenue: 72000000 },
        { month: '2024-01', spend: 22000000, leads: 120, newStudents: 38, revenue: 85000000 }
      ],
      topCampaignIds: [1, 2],
      notes: 'Primary acquisition channel for IELTS leads'
    },
    {
      id: 2,
      name: 'Google Search',
      type: 'PAID',
      status: 'ACTIVE',
      owner: 'Marketing Team',
      createdAt: '2022-08-01T00:00:00Z',
      updatedAt: '2024-01-22T09:30:00Z',
      totalCampaigns: 5,
      defaultSortMetric: 'newStudents',
      summary: {
        spendToDate: 98000000,
        revenueToDate: 410000000,
        leadsToDate: 690,
        newStudentsToDate: 240
      },
      monthlyStats: [
        { month: '2023-11', spend: 15000000, leads: 80, newStudents: 24, revenue: 62000000 },
        { month: '2023-12', spend: 16500000, leads: 88, newStudents: 27, revenue: 68000000 },
        { month: '2024-01', spend: 17000000, leads: 90, newStudents: 26, revenue: 70000000 }
      ],
      topCampaignIds: [1, 3],
      notes: 'Strong performance for corporate TOEIC packages'
    },
    {
      id: 3,
      name: 'Email Newsletter',
      type: 'OWNED',
      status: 'ACTIVE',
      owner: 'CRM Team',
      createdAt: '2021-05-10T00:00:00Z',
      updatedAt: '2024-01-18T08:00:00Z',
      totalCampaigns: 6,
      defaultSortMetric: 'leads',
      summary: {
        spendToDate: 15000000,
        revenueToDate: 210000000,
        leadsToDate: 540,
        newStudentsToDate: 160
      },
      monthlyStats: [
        { month: '2023-11', spend: 1200000, leads: 40, newStudents: 10, revenue: 18000000 },
        { month: '2023-12', spend: 1300000, leads: 45, newStudents: 12, revenue: 20000000 },
        { month: '2024-01', spend: 1400000, leads: 48, newStudents: 11, revenue: 19500000 }
      ],
      topCampaignIds: [3, 4],
      notes: 'Best channel for nurturing repeat students'
    },
    {
      id: 4,
      name: 'Offline Events',
      type: 'OFFLINE',
      status: 'ACTIVE',
      owner: 'Community Team',
      createdAt: '2022-03-20T00:00:00Z',
      updatedAt: '2024-01-30T17:45:00Z',
      totalCampaigns: 3,
      defaultSortMetric: 'leads',
      summary: {
        spendToDate: 42000000,
        revenueToDate: 95000000,
        leadsToDate: 260,
        newStudentsToDate: 64
      },
      monthlyStats: [
        { month: '2023-11', spend: 6000000, leads: 20, newStudents: 6, revenue: 15000000 },
        { month: '2023-12', spend: 7000000, leads: 28, newStudents: 8, revenue: 18000000 },
        { month: '2024-01', spend: 8000000, leads: 32, newStudents: 9, revenue: 21000000 }
      ],
      topCampaignIds: [2, 4],
      notes: 'Include school fairs and open days'
    }
  ],
  campaigns: [
    {
      id: 1,
      campaignCode: 'CMP-0001',
      name: 'IELTS Spring 2024',
      startDate: '2024-01-05T00:00:00Z',
      endDate: '2024-03-31T23:59:59Z',
      status: 'ACTIVE',
      channelIds: [1, 2],
      budget: 50000000,
      actualCost: 32000000,
      expectedRevenue: 150000000,
      actualRevenue: 95000000,
      expectedStudents: 60,
      newStudents: 32,
      potentialStudents: 78,
      conversionRate: 0.41,
      roi: 1.97,
      responsibleStaffId: 1,
      goalRevenue: 120000000,
      goalNewStudents: 40,
      goalLeads: 120,
      tags: ['IELTS', 'Quarter1'],
      description: 'Integrated IELTS acquisition campaign with webinars and paid ads',
      metricsHistory: [
        { month: '2024-01', spend: 12000000, leads: 45, newStudents: 18, revenue: 52000000, profit: 40000000 },
        { month: '2024-02', spend: 11000000, leads: 33, newStudents: 10, revenue: 28000000, profit: 17000000 }
      ],
      createdAt: '2023-12-10T09:00:00Z',
      updatedAt: '2024-02-10T08:30:00Z'
    },
    {
      id: 2,
      campaignCode: 'CMP-0002',
      name: 'Kids Summer 2024',
      startDate: '2024-04-01T00:00:00Z',
      endDate: '2024-06-30T23:59:59Z',
      status: 'PLANNING',
      channelIds: [1, 4],
      budget: 40000000,
      actualCost: 5000000,
      expectedRevenue: 120000000,
      actualRevenue: 0,
      expectedStudents: 70,
      newStudents: 0,
      potentialStudents: 25,
      conversionRate: 0,
      roi: 0,
      responsibleStaffId: 3,
      goalRevenue: 100000000,
      goalNewStudents: 55,
      goalLeads: 180,
      tags: ['Kids', 'Summer'],
      description: 'Summer program targeting kids aged 7-12 with weekend events',
      metricsHistory: [
        { month: '2024-01', spend: 2000000, leads: 8, newStudents: 0, revenue: 0, profit: -2000000 },
        { month: '2024-02', spend: 3000000, leads: 17, newStudents: 0, revenue: 0, profit: -3000000 }
      ],
      createdAt: '2024-01-05T07:45:00Z',
      updatedAt: '2024-02-08T11:20:00Z'
    },
    {
      id: 3,
      campaignCode: 'CMP-0003',
      name: 'TOEIC Corporate 2023',
      startDate: '2023-09-01T00:00:00Z',
      endDate: '2023-12-15T23:59:59Z',
      status: 'COMPLETED',
      channelIds: [2, 3],
      budget: 30000000,
      actualCost: 28000000,
      expectedRevenue: 90000000,
      actualRevenue: 110000000,
      expectedStudents: 45,
      newStudents: 52,
      potentialStudents: 90,
      conversionRate: 0.58,
      roi: 2.93,
      responsibleStaffId: 2,
      goalRevenue: 85000000,
      goalNewStudents: 40,
      goalLeads: 100,
      tags: ['TOEIC', 'Corporate'],
      description: 'B2B outreach for corporate TOEIC upskilling packages',
      metricsHistory: [
        { month: '2023-09', spend: 6000000, leads: 20, newStudents: 12, revenue: 22000000, profit: 16000000 },
        { month: '2023-10', spend: 7000000, leads: 25, newStudents: 14, revenue: 26000000, profit: 19000000 },
        { month: '2023-11', spend: 7500000, leads: 28, newStudents: 15, revenue: 30000000, profit: 22500000 },
        { month: '2023-12', spend: 7500000, leads: 17, newStudents: 11, revenue: 32000000, profit: 24500000 }
      ],
      createdAt: '2023-07-28T10:10:00Z',
      updatedAt: '2023-12-20T18:00:00Z'
    },
    {
      id: 4,
      campaignCode: 'CMP-0004',
      name: 'Speaking Club Awareness',
      startDate: '2023-11-15T00:00:00Z',
      endDate: '2024-02-28T23:59:59Z',
      status: 'ON_HOLD',
      channelIds: [3, 4],
      budget: 15000000,
      actualCost: 9000000,
      expectedRevenue: 22000000,
      actualRevenue: 8000000,
      expectedStudents: 35,
      newStudents: 9,
      potentialStudents: 58,
      conversionRate: 0.16,
      roi: -0.11,
      responsibleStaffId: 4,
      goalRevenue: 20000000,
      goalNewStudents: 25,
      goalLeads: 90,
      tags: ['Speaking', 'Community'],
      description: 'Mixed online and offline events to promote speaking club membership',
      metricsHistory: [
        { month: '2023-11', spend: 2000000, leads: 15, newStudents: 4, revenue: 4000000, profit: 2000000 },
        { month: '2023-12', spend: 3000000, leads: 18, newStudents: 3, revenue: 2200000, profit: -800000 },
        { month: '2024-01', spend: 4000000, leads: 25, newStudents: 2, revenue: 1800000, profit: -2200000 }
      ],
      createdAt: '2023-10-01T08:20:00Z',
      updatedAt: '2024-01-25T14:45:00Z'
    }
  ],
  revenueRecords: [
    {
      id: 1,
      receiptNumber: 'RCV-2024-0001',
      studentId: 1,
      campaignId: 1,
      channelId: 1,
      amount: 3000000,
      discountAmount: 0,
      netAmount: 3000000,
      paymentMethod: 'BANK_TRANSFER',
      paymentDate: '2024-01-06T09:15:00Z',
      recordedByStaffId: 2,
      notes: 'Paid in full after webinar follow up'
    },
    {
      id: 2,
      receiptNumber: 'RCV-2023-0120',
      studentId: 2,
      campaignId: 4,
      channelId: 4,
      amount: 1500000,
      discountAmount: 0,
      netAmount: 1500000,
      paymentMethod: 'CASH',
      paymentDate: '2023-12-22T18:45:00Z',
      recordedByStaffId: 4,
      notes: 'Collected at weekend speaking event'
    },
    {
      id: 3,
      receiptNumber: 'RCV-2023-0104',
      studentId: 3,
      campaignId: 3,
      channelId: 2,
      amount: 2500000,
      discountAmount: 250000,
      netAmount: 2250000,
      paymentMethod: 'BANK_TRANSFER',
      paymentDate: '2023-10-12T11:00:00Z',
      recordedByStaffId: 3,
      notes: 'Corporate discount 10 percent'
    },
    {
      id: 4,
      receiptNumber: 'RCV-2023-0090',
      studentId: 5,
      campaignId: 3,
      channelId: 3,
      amount: 3500000,
      discountAmount: 0,
      netAmount: 3500000,
      paymentMethod: 'CREDIT_CARD',
      paymentDate: '2023-09-18T14:10:00Z',
      recordedByStaffId: 1,
      notes: 'Paid in full via online portal'
    },
    {
      id: 5,
      receiptNumber: 'RCV-2024-0015',
      studentId: 4,
      campaignId: 1,
      channelId: 1,
      amount: 4200000,
      discountAmount: 0,
      netAmount: 2000000,
      paymentMethod: 'EWALLET',
      paymentDate: '2024-01-23T09:45:00Z',
      recordedByStaffId: 2,
      notes: 'Partial payment, follow up required for remaining balance'
    },
    {
      id: 6,
      receiptNumber: 'RCV-2024-0018',
      studentId: 2,
      campaignId: null,
      channelId: null,
      amount: 500000,
      discountAmount: 0,
      netAmount: 500000,
      paymentMethod: 'CASH',
      paymentDate: '2024-01-15T17:00:00Z',
      recordedByStaffId: 4,
      notes: 'Speaking club renewal without linked campaign'
    }
  ],
  marketingAnalytics: {
    overviewTimeseries: [
      { date: '2023-10-01', newStudents: 14, potentialStudents: 38, revenue: 48000000, campaignRevenue: 42000000, profit: 20000000 },
      { date: '2023-11-01', newStudents: 16, potentialStudents: 45, revenue: 51000000, campaignRevenue: 46000000, profit: 23000000 },
      { date: '2023-12-01', newStudents: 19, potentialStudents: 52, revenue: 56000000, campaignRevenue: 49000000, profit: 24000000 },
      { date: '2024-01-01', newStudents: 21, potentialStudents: 60, revenue: 62000000, campaignRevenue: 57000000, profit: 25000000 },
      { date: '2024-02-01', newStudents: 12, potentialStudents: 35, revenue: 38000000, campaignRevenue: 32000000, profit: 12000000 },
      { date: '2024-03-01', newStudents: 8, potentialStudents: 28, revenue: 29000000, campaignRevenue: 24000000, profit: 8000000 }
    ],
    roiSummary: {
      averageCampaignRoi: 1.45,
      highestRoiCampaignId: 3,
      lowestRoiCampaignId: 4
    },
    channelPerformance: [
      { channelId: 1, month: '2024-01', campaignCount: 2, spend: 22000000, revenue: 85000000, newStudents: 38, leads: 120, roi: 2.86 },
      { channelId: 2, month: '2024-01', campaignCount: 2, spend: 17000000, revenue: 70000000, newStudents: 26, leads: 90, roi: 3.12 },
      { channelId: 3, month: '2024-01', campaignCount: 2, spend: 1400000, revenue: 19500000, newStudents: 11, leads: 48, roi: 12.93 },
      { channelId: 4, month: '2024-01', campaignCount: 2, spend: 8000000, revenue: 21000000, newStudents: 9, leads: 32, roi: 1.63 }
    ],
    campaignRankings: {
      byRevenue: [
        { campaignId: 3, value: 110000000 },
        { campaignId: 1, value: 95000000 },
        { campaignId: 4, value: 8000000 },
        { campaignId: 2, value: 0 }
      ],
      byNewStudents: [
        { campaignId: 3, value: 52 },
        { campaignId: 1, value: 32 },
        { campaignId: 4, value: 9 },
        { campaignId: 2, value: 0 }
      ],
      byConversionRate: [
        { campaignId: 3, value: 0.58 },
        { campaignId: 1, value: 0.41 },
        { campaignId: 4, value: 0.16 },
        { campaignId: 2, value: 0 }
      ],
      byRoi: [
        { campaignId: 3, value: 2.93 },
        { campaignId: 1, value: 1.97 },
        { campaignId: 2, value: 0 },
        { campaignId: 4, value: -0.11 }
      ]
    },
    conversionFunnel: {
      awareness: 1250,
      engaged: 640,
      trials: 180,
      enrolled: 115,
      graduated: 48
    },
    leadSources: [
      { source: 'Facebook Ads', leads: 320, converted: 98 },
      { source: 'Google Search', leads: 250, converted: 85 },
      { source: 'Email Newsletter', leads: 180, converted: 62 },
      { source: 'Offline Events', leads: 110, converted: 35 }
    ]
  },
  marketingEnums: {
    studentStatuses: ['ACTIVE', 'GRADUATED', 'ON_HOLD', 'DROPPED'],
    enrollmentStatuses: ['ENROLLED', 'PENDING', 'COMPLETED', 'CANCELLED'],
    potentialStudentStatuses: ['TRIAL', 'REGISTERED', 'NOT_REGISTERED'],
    interestLevels: ['HIGH', 'MEDIUM', 'LOW'],
    campaignStatuses: ['PLANNING', 'ACTIVE', 'COMPLETED', 'ON_HOLD'],
    channelTypes: ['PAID', 'OWNED', 'EARNED', 'OFFLINE'],
    paymentMethods: ['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'EWALLET']
  },

  // PhanCongChienDich data (Phân công chiến dịch)
  phanCongChienDich: [
    {
      MaCD: 1,
      MaNV: 1,
      VaiTro: 'Trưởng nhóm',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      MaCD: 1,
      MaNV: 5,
      VaiTro: 'Marketing',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      MaCD: 2,
      MaNV: 2,
      VaiTro: 'Trưởng nhóm',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    {
      MaCD: 2,
      MaNV: 3,
      VaiTro: 'Hỗ trợ',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    {
      MaCD: 3,
      MaNV: 1,
      VaiTro: 'Trưởng nhóm',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      MaCD: 3,
      MaNV: 4,
      VaiTro: 'Tư vấn',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ],

  // ChiTietKenhChienDich data (Chi tiết kênh chiến dịch)
  chiTietKenhChienDich: [
    {
      MaKenh: 1,
      MaCD: 1,
      SoHVTN: 25,
      SoHVMoi: 15,
      ChiPhiTB: 500000,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      MaKenh: 2,
      MaCD: 1,
      SoHVTN: 18,
      SoHVMoi: 12,
      ChiPhiTB: 300000,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      MaKenh: 3,
      MaCD: 2,
      SoHVTN: 30,
      SoHVMoi: 20,
      ChiPhiTB: 400000,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    {
      MaKenh: 4,
      MaCD: 2,
      SoHVTN: 22,
      SoHVMoi: 18,
      ChiPhiTB: 350000,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    {
      MaKenh: 5,
      MaCD: 3,
      SoHVTN: 35,
      SoHVMoi: 25,
      ChiPhiTB: 600000,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      MaKenh: 6,
      MaCD: 3,
      SoHVTN: 40,
      SoHVMoi: 30,
      ChiPhiTB: 200000,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ],

  // Configuration data
  config: {
    centerName: 'Brain Stem English Center',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    phone: '0123456789',
    email: 'info@brainstem.edu.vn',
    openingHours: '07:00 - 21:00',
    description: 'Trung tâm tiếng Anh chuyên nghiệp với đội ngũ giáo viên bản ngữ và phương pháp giảng dạy hiện đại',
    logo: '/img/logo.png',
    socialMedia: {
      facebook: 'https://facebook.com/brainstemenglish',
      instagram: 'https://instagram.com/brainstemenglish',
      zalo: 'https://zalo.me/brainstemenglish'
    }
  }
};

// Helper functions for mock data
export const mockApiResponse = (data, metadata = null) => {
  return {
    code: 200,
    message: 'Success',
    data: data,
    metadata: metadata || {
      page: 0,
      size: 20,
      totalElements: data.length,
      totalPages: Math.ceil(data.length / 20),
      first: true,
      last: true
    }
  };
};

export const mockErrorResponse = (message = 'Error occurred', code = 400) => {
  return {
    code: code,
    message: message,
    error: true
  };
};

// Pagination helper
export const paginateData = (data, page = 0, size = 20) => {
  const start = page * size;
  const end = start + size;
  const paginatedData = data.slice(start, end);
  
  return {
    data: paginatedData,
    metadata: {
      page: page,
      size: size,
      totalElements: data.length,
      totalPages: Math.ceil(data.length / size),
      first: page === 0,
      last: page >= Math.ceil(data.length / size) - 1
    }
  };
};

// Filter helper
export const filterData = (data, filters) => {
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      
      const itemValue = item[key];
      if (typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(value.toLowerCase());
      }
      return itemValue === value;
    });
  });
};
