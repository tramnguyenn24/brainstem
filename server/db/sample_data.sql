-- ============================================
-- DỮ LIỆU MẪU CHO BRAINSTEM ENGLISH CENTER
-- File này chứa dữ liệu mẫu để test hệ thống
-- Chạy file này trong pgAdmin4 Query Tool
-- ============================================

-- Xóa dữ liệu cũ (nếu cần)
-- TRUNCATE TABLE students, leads, campaign_channels, campaigns, courses, staff, channels, forms, media CASCADE;

-- ============================================
-- 1. CHANNELS (Kênh truyền thông)
-- ============================================
INSERT INTO channels (id, name, type, status) VALUES
(1, 'Facebook Ads', 'social_media', 'active'),
(2, 'Google Ads', 'search_engine', 'active'),
(3, 'TikTok Ads', 'social_media', 'active'),
(4, 'Zalo Ads', 'social_media', 'active'),
(5, 'Website', 'organic', 'active'),
(6, 'Referral', 'word_of_mouth', 'active'),
(7, 'Email Marketing', 'email', 'active'),
(8, 'YouTube', 'social_media', 'active')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('channels_id_seq', (SELECT MAX(id) FROM channels));

-- ============================================
-- 2. STAFF (Nhân viên)
-- ============================================
INSERT INTO staff (id, name, role, status, department) VALUES
(1, 'Nguyễn Văn An', 'manager', 'active', 'Marketing'),
(2, 'Trần Thị Bình', 'marketing', 'active', 'Marketing'),
(3, 'Lê Văn Cường', 'sales', 'active', 'Sales'),
(4, 'Phạm Thị Dung', 'sales', 'active', 'Sales'),
(5, 'Hoàng Văn Em', 'teacher', 'active', 'Education'),
(6, 'Vũ Thị Phương', 'teacher', 'active', 'Education'),
(7, 'Đặng Văn Giang', 'support', 'active', 'Support'),
(8, 'Bùi Thị Hoa', 'admin', 'active', 'Administration')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('staff_id_seq', (SELECT MAX(id) FROM staff));

-- ============================================
-- 3. COURSES (Khóa học)
-- ============================================
INSERT INTO courses (id, name, description, price, status, created_at, updated_at) VALUES
(1, 'IELTS Foundation', 'Khóa học IELTS cơ bản từ 4.0 đến 5.5', 5000000, 'active', NOW(), NOW()),
(2, 'IELTS Advanced', 'Khóa học IELTS nâng cao từ 6.0 đến 7.5+', 8000000, 'active', NOW(), NOW()),
(3, 'TOEIC 450-750', 'Khóa học TOEIC từ 450 đến 750 điểm', 4000000, 'active', NOW(), NOW()),
(4, 'Business English', 'Tiếng Anh công sở và thương mại', 6000000, 'active', NOW(), NOW()),
(5, 'Speaking Club', 'Câu lạc bộ nói tiếng Anh', 2000000, 'active', NOW(), NOW()),
(6, 'Grammar Master', 'Ngữ pháp tiếng Anh toàn diện', 3500000, 'active', NOW(), NOW()),
(7, 'Pronunciation Course', 'Khóa học phát âm chuẩn', 3000000, 'active', NOW(), NOW()),
(8, 'Kids English', 'Tiếng Anh cho trẻ em', 4500000, 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('courses_id_seq', (SELECT MAX(id) FROM courses));

-- ============================================
-- 4. CAMPAIGNS (Chiến dịch)
-- ============================================
INSERT INTO campaigns (id, name, status, channel_id, owner_staff_id, budget, spend, cost, revenue, potential_students_count, new_students_count, roi, created_at, updated_at) VALUES
(1, 'Chiến dịch Tết 2025 - IELTS', 'running', 1, 1, 50000000, 35000000, 35000000, 120000000, 45, 18, 242.86, '2024-12-01 00:00:00+07', NOW()),
(2, 'Back to School - TOEIC', 'running', 2, 2, 30000000, 22000000, 22000000, 80000000, 38, 15, 263.64, '2024-11-15 00:00:00+07', NOW()),
(3, 'Summer Camp 2025', 'paused', 3, 1, 40000000, 28000000, 28000000, 95000000, 52, 22, 239.29, '2024-10-01 00:00:00+07', NOW()),
(4, 'Business English Promotion', 'running', 4, 3, 25000000, 18000000, 18000000, 60000000, 28, 12, 233.33, '2024-12-10 00:00:00+07', NOW()),
(5, 'New Year Special - Speaking Club', 'completed', 1, 2, 15000000, 15000000, 15000000, 40000000, 35, 20, 166.67, '2024-11-01 00:00:00+07', NOW()),
(6, 'Grammar Master Launch', 'running', 2, 1, 20000000, 12000000, 12000000, 35000000, 25, 10, 191.67, '2024-12-05 00:00:00+07', NOW())
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('campaigns_id_seq', (SELECT MAX(id) FROM campaigns));

-- ============================================
-- 5. CAMPAIGN_CHANNELS (Chiến dịch - Kênh)
-- ============================================
INSERT INTO campaign_channels (id, campaign_id, channel_id, cost, created_at, updated_at) VALUES
(1, 1, 1, 20000000, NOW(), NOW()),
(2, 1, 2, 15000000, NOW(), NOW()),
(3, 2, 2, 22000000, NOW(), NOW()),
(4, 3, 3, 18000000, NOW(), NOW()),
(5, 3, 1, 10000000, NOW(), NOW()),
(6, 4, 4, 18000000, NOW(), NOW()),
(7, 5, 1, 15000000, NOW(), NOW()),
(8, 6, 2, 12000000, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('campaign_channels_id_seq', (SELECT MAX(id) FROM campaign_channels));

-- ============================================
-- 6. LEADS (Học viên tiềm năng)
-- ============================================
INSERT INTO leads (id, full_name, email, phone, status, interest_level, campaign_id, channel_id, assigned_staff_id, tags, created_at, updated_at) VALUES
(1, 'Nguyễn Thị Mai', 'mainguyen@gmail.com', '0901234567', 'INTERESTED', 'high', 1, 1, 3, ARRAY['ielts', 'beginner'], '2024-12-01 10:00:00+07', NOW()),
(2, 'Trần Văn Nam', 'namtran@gmail.com', '0912345678', 'CONTACTED', 'medium', 1, 1, 3, ARRAY['ielts', 'intermediate'], '2024-12-02 11:00:00+07', NOW()),
(3, 'Lê Thị Hoa', 'hoale@gmail.com', '0923456789', 'QUALIFIED', 'high', 1, 2, 4, ARRAY['ielts', 'advanced'], '2024-12-03 09:00:00+07', NOW()),
(4, 'Phạm Văn Đức', 'ducpham@gmail.com', '0934567890', 'CONVERTED', 'high', 1, 1, 3, ARRAY['ielts'], '2024-12-04 14:00:00+07', NOW()),
(5, 'Hoàng Thị Lan', 'lanhoang@gmail.com', '0945678901', 'INTERESTED', 'medium', 2, 2, 4, ARRAY['toeic'], '2024-12-05 10:30:00+07', NOW()),
(6, 'Vũ Văn Minh', 'minhvu@gmail.com', '0956789012', 'CONTACTED', 'high', 2, 2, 3, ARRAY['toeic', 'business'], '2024-12-06 15:00:00+07', NOW()),
(7, 'Đặng Thị Nga', 'ngadang@gmail.com', '0967890123', 'QUALIFIED', 'high', 2, 2, 4, ARRAY['toeic'], '2024-12-07 11:00:00+07', NOW()),
(8, 'Bùi Văn Phong', 'phongbui@gmail.com', '0978901234', 'INTERESTED', 'low', 3, 3, 3, ARRAY['summer'], '2024-12-08 09:00:00+07', NOW()),
(9, 'Ngô Thị Quỳnh', 'quynhngo@gmail.com', '0989012345', 'CONTACTED', 'medium', 3, 1, 4, ARRAY['summer', 'kids'], '2024-12-09 13:00:00+07', NOW()),
(10, 'Đỗ Văn Sơn', 'sondo@gmail.com', '0990123456', 'INTERESTED', 'high', 4, 4, 3, ARRAY['business'], '2024-12-10 10:00:00+07', NOW()),
(11, 'Lý Thị Tuyết', 'tuyetly@gmail.com', '0901123456', 'QUALIFIED', 'high', 4, 4, 4, ARRAY['business', 'advanced'], '2024-12-11 14:30:00+07', NOW()),
(12, 'Võ Văn Uyên', 'uyenvu@gmail.com', '0912234567', 'CONVERTED', 'high', 5, 1, 3, ARRAY['speaking'], '2024-12-12 09:00:00+07', NOW()),
(13, 'Cao Thị Vân', 'vancao@gmail.com', '0923345678', 'INTERESTED', 'medium', 5, 1, 4, ARRAY['speaking'], '2024-12-13 11:00:00+07', NOW()),
(14, 'Dương Văn Xuyên', 'xuyenduong@gmail.com', '0934456789', 'CONTACTED', 'high', 6, 2, 3, ARRAY['grammar'], '2024-12-14 15:00:00+07', NOW()),
(15, 'Hồ Thị Yến', 'yenho@gmail.com', '0945567890', 'INTERESTED', 'low', 6, 2, 4, ARRAY['grammar', 'beginner'], '2024-12-15 10:00:00+07', NOW()),
(16, 'Kim Văn Anh', 'anhkim@gmail.com', '0956678901', 'LOST', 'low', 1, 1, 3, ARRAY['ielts'], '2024-11-20 09:00:00+07', NOW()),
(17, 'Lưu Thị Bích', 'bichluu@gmail.com', '0967789012', 'INTERESTED', 'medium', 2, 2, 4, ARRAY['toeic'], '2024-12-16 11:00:00+07', NOW()),
(18, 'Mai Văn Cường', 'cuongmai@gmail.com', '0978890123', 'CONTACTED', 'high', 3, 3, 3, ARRAY['summer'], '2024-12-17 14:00:00+07', NOW()),
(19, 'Nguyễn Thị Dung', 'dungnguyen2@gmail.com', '0989901234', 'QUALIFIED', 'high', 4, 4, 4, ARRAY['business'], '2024-12-18 09:30:00+07', NOW()),
(20, 'Phan Văn Em', 'emphan@gmail.com', '0990012345', 'INTERESTED', 'medium', 5, 1, 3, ARRAY['speaking'], '2024-12-19 13:00:00+07', NOW()),
-- Leads từ các tháng trước (Tháng 11/2024)
(21, 'Trần Văn Hùng', 'hungtran@gmail.com', '0901234568', 'CONVERTED', 'high', 1, 1, 3, ARRAY['ielts'], '2024-11-05 10:00:00+07', NOW()),
(22, 'Lê Thị Lan', 'lanle2@gmail.com', '0912345679', 'QUALIFIED', 'high', 2, 2, 4, ARRAY['toeic'], '2024-11-10 14:00:00+07', NOW()),
(23, 'Phạm Văn Minh', 'minhpham@gmail.com', '0923456780', 'CONVERTED', 'high', 1, 1, 3, ARRAY['ielts'], '2024-11-15 09:00:00+07', NOW()),
(24, 'Hoàng Thị Nga', 'ngahoang2@gmail.com', '0934567891', 'INTERESTED', 'medium', 3, 3, 3, ARRAY['summer'], '2024-11-20 11:00:00+07', NOW()),
(25, 'Vũ Văn Phong', 'phongvu@gmail.com', '0945678902', 'CONTACTED', 'high', 4, 4, 4, ARRAY['business'], '2024-11-25 15:00:00+07', NOW()),
-- Leads từ tháng 10/2024
(26, 'Đặng Thị Quỳnh', 'quynhdang@gmail.com', '0956789013', 'CONVERTED', 'high', 1, 1, 3, ARRAY['ielts'], '2024-10-05 10:00:00+07', NOW()),
(27, 'Bùi Văn Sơn', 'sonbui@gmail.com', '0967890124', 'QUALIFIED', 'high', 2, 2, 4, ARRAY['toeic'], '2024-10-10 14:00:00+07', NOW()),
(28, 'Ngô Thị Tuyết', 'tuyetngo@gmail.com', '0978901235', 'CONVERTED', 'high', 5, 1, 3, ARRAY['speaking'], '2024-10-15 09:00:00+07', NOW()),
(29, 'Đỗ Văn Uyên', 'uyendo@gmail.com', '0989012346', 'INTERESTED', 'medium', 3, 3, 3, ARRAY['summer'], '2024-10-20 11:00:00+07', NOW()),
(30, 'Lý Thị Vân', 'vanly@gmail.com', '0990123457', 'CONTACTED', 'high', 4, 4, 4, ARRAY['business'], '2024-10-25 15:00:00+07', NOW()),
-- Leads từ tháng 9/2024
(31, 'Võ Văn Xuyên', 'xuyenvu@gmail.com', '0901234569', 'CONVERTED', 'high', 1, 1, 3, ARRAY['ielts'], '2024-09-05 10:00:00+07', NOW()),
(32, 'Cao Thị Yến', 'yencao@gmail.com', '0912345680', 'QUALIFIED', 'high', 2, 2, 4, ARRAY['toeic'], '2024-09-10 14:00:00+07', NOW()),
(33, 'Dương Văn Anh', 'anhduong@gmail.com', '0923456791', 'CONVERTED', 'high', 6, 2, 3, ARRAY['grammar'], '2024-09-15 09:00:00+07', NOW()),
(34, 'Hồ Thị Bích', 'bichho@gmail.com', '0934567902', 'INTERESTED', 'medium', 3, 3, 3, ARRAY['summer'], '2024-09-20 11:00:00+07', NOW()),
(35, 'Kim Văn Cường', 'cuongkim@gmail.com', '0945679013', 'CONTACTED', 'high', 4, 4, 4, ARRAY['business'], '2024-09-25 15:00:00+07', NOW()),
-- Leads từ tháng 8/2024
(36, 'Lưu Thị Dung', 'dungluu@gmail.com', '0956780124', 'CONVERTED', 'high', 1, 1, 3, ARRAY['ielts'], '2024-08-05 10:00:00+07', NOW()),
(37, 'Mai Văn Em', 'emmai@gmail.com', '0967891235', 'QUALIFIED', 'high', 2, 2, 4, ARRAY['toeic'], '2024-08-10 14:00:00+07', NOW()),
(38, 'Nguyễn Thị Phương', 'phuongnguyen3@gmail.com', '0978902346', 'CONVERTED', 'high', 5, 1, 3, ARRAY['speaking'], '2024-08-15 09:00:00+07', NOW()),
(39, 'Phan Văn Giang', 'giangphan@gmail.com', '0989013457', 'INTERESTED', 'medium', 3, 3, 3, ARRAY['summer'], '2024-08-20 11:00:00+07', NOW()),
(40, 'Trần Thị Hoa', 'hoatran2@gmail.com', '0990124568', 'CONTACTED', 'high', 4, 4, 4, ARRAY['business'], '2024-08-25 15:00:00+07', NOW()),
-- Leads từ tháng 7/2024
(41, 'Lê Văn Khoa', 'khoale@gmail.com', '0901235679', 'CONVERTED', 'high', 1, 1, 3, ARRAY['ielts'], '2024-07-05 10:00:00+07', NOW()),
(42, 'Phạm Thị Linh', 'linhpham2@gmail.com', '0912346780', 'QUALIFIED', 'high', 2, 2, 4, ARRAY['toeic'], '2024-07-10 14:00:00+07', NOW()),
(43, 'Hoàng Văn Mạnh', 'manhhoang@gmail.com', '0923457891', 'CONVERTED', 'high', 6, 2, 3, ARRAY['grammar'], '2024-07-15 09:00:00+07', NOW()),
(44, 'Vũ Thị Nga', 'ngavu2@gmail.com', '0934568902', 'INTERESTED', 'medium', 3, 3, 3, ARRAY['summer'], '2024-07-20 11:00:00+07', NOW()),
(45, 'Đặng Văn Oanh', 'oanhdang@gmail.com', '0945679013', 'CONTACTED', 'high', 4, 4, 4, ARRAY['business'], '2024-07-25 15:00:00+07', NOW()),
-- Leads từ tháng 6/2024
(46, 'Bùi Thị Phượng', 'phuongbui@gmail.com', '0956780124', 'CONVERTED', 'high', 1, 1, 3, ARRAY['ielts'], '2024-06-05 10:00:00+07', NOW()),
(47, 'Ngô Văn Quang', 'quangngo@gmail.com', '0967891235', 'QUALIFIED', 'high', 2, 2, 4, ARRAY['toeic'], '2024-06-10 14:00:00+07', NOW()),
(48, 'Đỗ Thị Rạng', 'rangdo@gmail.com', '0978902346', 'CONVERTED', 'high', 5, 1, 3, ARRAY['speaking'], '2024-06-15 09:00:00+07', NOW()),
(49, 'Lý Văn Sơn', 'sonly@gmail.com', '0989013457', 'INTERESTED', 'medium', 3, 3, 3, ARRAY['summer'], '2024-06-20 11:00:00+07', NOW()),
(50, 'Võ Thị Tuyết', 'tuyetvo@gmail.com', '0990124568', 'CONTACTED', 'high', 4, 4, 4, ARRAY['business'], '2024-06-25 15:00:00+07', NOW())
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('leads_id_seq', (SELECT MAX(id) FROM leads));

-- ============================================
-- 7. STUDENTS (Học viên)
-- ============================================
INSERT INTO students (id, full_name, email, phone, status, enrollment_status, campaign_id, channel_id, course_id, assigned_staff_id, new_student, source_lead_id, created_at, updated_at) VALUES
(1, 'Nguyễn Thị Mai', 'mainguyen@gmail.com', '0901234567', 'active', 'enrolled', 1, 1, 1, 5, true, 1, '2024-12-05 10:00:00+07', NOW()),
(2, 'Phạm Văn Đức', 'ducpham@gmail.com', '0934567890', 'active', 'enrolled', 1, 1, 2, 5, true, 4, '2024-12-06 14:00:00+07', NOW()),
(3, 'Lê Thị Hoa', 'hoale@gmail.com', '0923456789', 'active', 'enrolled', 1, 2, 2, 6, true, 3, '2024-12-07 09:00:00+07', NOW()),
(4, 'Trần Văn Nam', 'namtran@gmail.com', '0912345678', 'active', 'enrolled', 1, 1, 1, 5, true, 2, '2024-12-08 11:00:00+07', NOW()),
(5, 'Hoàng Thị Lan', 'lanhoang@gmail.com', '0945678901', 'active', 'enrolled', 2, 2, 3, 5, true, 5, '2024-12-09 10:30:00+07', NOW()),
(6, 'Vũ Văn Minh', 'minhvu@gmail.com', '0956789012', 'active', 'enrolled', 2, 2, 3, 5, true, 6, '2024-12-10 15:00:00+07', NOW()),
(7, 'Đặng Thị Nga', 'ngadang@gmail.com', '0967890123', 'active', 'enrolled', 2, 2, 3, 6, true, 7, '2024-12-11 11:00:00+07', NOW()),
(8, 'Võ Văn Uyên', 'uyenvu@gmail.com', '0912234567', 'active', 'enrolled', 5, 1, 5, 6, true, 12, '2024-12-13 09:00:00+07', NOW()),
(9, 'Lý Thị Tuyết', 'tuyetly@gmail.com', '0901123456', 'active', 'enrolled', 4, 4, 4, 5, true, 11, '2024-12-12 14:30:00+07', NOW()),
(10, 'Cao Thị Vân', 'vancao@gmail.com', '0923345678', 'active', 'enrolled', 5, 1, 5, 6, true, 13, '2024-12-14 11:00:00+07', NOW()),
(11, 'Dương Văn Xuyên', 'xuyenduong@gmail.com', '0934456789', 'active', 'enrolled', 6, 2, 6, 5, true, 14, '2024-12-15 15:00:00+07', NOW()),
(12, 'Nguyễn Văn Anh', 'anhnguyen@gmail.com', '0945567890', 'active', 'enrolled', 1, 1, 1, 5, true, NULL, '2024-11-15 10:00:00+07', NOW()),
(13, 'Trần Thị Bình', 'binhtran@gmail.com', '0956678901', 'active', 'enrolled', 2, 2, 3, 6, true, NULL, '2024-11-20 14:00:00+07', NOW()),
(14, 'Lê Văn Cường', 'cuongle@gmail.com', '0967789012', 'active', 'enrolled', 3, 3, 8, 5, true, NULL, '2024-11-25 09:00:00+07', NOW()),
(15, 'Phạm Thị Dung', 'dungpham@gmail.com', '0978890123', 'active', 'enrolled', 4, 4, 4, 6, true, NULL, '2024-11-30 11:00:00+07', NOW()),
(16, 'Hoàng Văn Em', 'emhoang@gmail.com', '0989901234', 'active', 'enrolled', 5, 1, 5, 5, true, NULL, '2024-12-01 15:00:00+07', NOW()),
(17, 'Vũ Thị Phương', 'phuongvu@gmail.com', '0990012345', 'active', 'enrolled', 6, 2, 6, 6, true, NULL, '2024-12-02 10:00:00+07', NOW()),
(18, 'Đặng Văn Giang', 'giangdang@gmail.com', '0901123456', 'active', 'enrolled', 1, 1, 2, 5, true, NULL, '2024-12-03 14:00:00+07', NOW()),
(19, 'Bùi Thị Hoa', 'hoabui@gmail.com', '0912234567', 'active', 'enrolled', 2, 2, 3, 6, true, NULL, '2024-12-04 09:00:00+07', NOW()),
(20, 'Ngô Văn Khoa', 'khoango@gmail.com', '0923345678', 'active', 'enrolled', 3, 3, 8, 5, true, NULL, '2024-12-05 11:00:00+07', NOW()),
(21, 'Đỗ Thị Linh', 'linhdo@gmail.com', '0934456789', 'active', 'enrolled', 4, 4, 4, 6, true, NULL, '2024-12-06 15:00:00+07', NOW()),
(22, 'Lý Văn Mạnh', 'manhly@gmail.com', '0945567890', 'active', 'enrolled', 5, 1, 5, 5, true, NULL, '2024-12-07 10:00:00+07', NOW()),
(23, 'Võ Thị Nga', 'ngavo@gmail.com', '0956678901', 'active', 'enrolled', 6, 2, 6, 6, true, NULL, '2024-12-08 14:00:00+07', NOW()),
(24, 'Cao Văn Oanh', 'oanhcao@gmail.com', '0967789012', 'active', 'enrolled', 1, 1, 1, 5, true, NULL, '2024-12-09 09:00:00+07', NOW()),
(25, 'Dương Thị Phượng', 'phuongduong@gmail.com', '0978890123', 'active', 'enrolled', 2, 2, 3, 6, true, NULL, '2024-12-10 11:00:00+07', NOW()),
(26, 'Hồ Văn Quang', 'quangho@gmail.com', '0989901234', 'active', 'enrolled', 3, 3, 8, 5, true, NULL, '2024-12-11 15:00:00+07', NOW()),
(27, 'Kim Thị Rạng', 'rangkim@gmail.com', '0990012345', 'active', 'enrolled', 4, 4, 4, 6, true, NULL, '2024-12-12 10:00:00+07', NOW()),
(28, 'Lưu Văn Sơn', 'sonluu@gmail.com', '0901123456', 'active', 'enrolled', 5, 1, 5, 5, true, NULL, '2024-12-13 14:00:00+07', NOW()),
(29, 'Mai Thị Tuyết', 'tuyetmai@gmail.com', '0912234567', 'active', 'enrolled', 6, 2, 6, 6, true, NULL, '2024-12-14 09:00:00+07', NOW()),
(30, 'Nguyễn Văn Uyên', 'uyennguyen2@gmail.com', '0923345678', 'active', 'enrolled', 1, 1, 2, 5, true, NULL, '2024-12-15 11:00:00+07', NOW()),
(31, 'Phan Thị Vân', 'vanphan@gmail.com', '0934456789', 'active', 'enrolled', 2, 2, 3, 6, true, NULL, '2024-12-16 15:00:00+07', NOW()),
(32, 'Trần Văn Xuyên', 'xuyentran@gmail.com', '0945567890', 'active', 'enrolled', 3, 3, 8, 5, true, NULL, '2024-12-17 10:00:00+07', NOW()),
(33, 'Lê Thị Yến', 'yenle@gmail.com', '0956678901', 'active', 'enrolled', 4, 4, 4, 6, true, NULL, '2024-12-18 14:00:00+07', NOW()),
(34, 'Phạm Văn Anh', 'anhpham@gmail.com', '0967789012', 'active', 'enrolled', 5, 1, 5, 5, true, NULL, '2024-12-19 09:00:00+07', NOW()),
(35, 'Hoàng Thị Bích', 'bichhoang@gmail.com', '0978890123', 'active', 'enrolled', 6, 2, 6, 6, true, NULL, '2024-12-20 11:00:00+07', NOW()),
(36, 'Vũ Văn Cường', 'cuongvu@gmail.com', '0989901234', 'active', 'enrolled', 1, 1, 1, 5, true, NULL, '2024-12-21 15:00:00+07', NOW()),
(37, 'Đặng Thị Dung', 'dungdang@gmail.com', '0990012345', 'active', 'enrolled', 2, 2, 3, 6, true, NULL, '2024-12-22 10:00:00+07', NOW()),
(38, 'Bùi Văn Em', 'embui@gmail.com', '0901123456', 'active', 'enrolled', 3, 3, 8, 5, true, NULL, '2024-12-23 14:00:00+07', NOW()),
(39, 'Ngô Thị Phương', 'phuongngo@gmail.com', '0912234567', 'active', 'enrolled', 4, 4, 4, 6, true, NULL, '2024-12-24 09:00:00+07', NOW()),
(40, 'Đỗ Văn Giang', 'giangdo@gmail.com', '0923345678', 'active', 'enrolled', 5, 1, 5, 5, true, NULL, '2024-12-25 11:00:00+07', NOW()),
(41, 'Lý Thị Hoa', 'hoaly@gmail.com', '0934456789', 'active', 'enrolled', 6, 2, 6, 6, true, NULL, '2024-12-26 15:00:00+07', NOW()),
(42, 'Võ Văn Khoa', 'khoavo@gmail.com', '0945567890', 'active', 'enrolled', 1, 1, 2, 5, true, NULL, '2024-12-27 10:00:00+07', NOW()),
(43, 'Cao Thị Linh', 'linhcao@gmail.com', '0956678901', 'active', 'enrolled', 2, 2, 3, 6, true, NULL, '2024-12-28 14:00:00+07', NOW()),
(44, 'Dương Văn Mạnh', 'manhduong@gmail.com', '0967789012', 'active', 'enrolled', 3, 3, 8, 5, true, NULL, '2024-12-29 09:00:00+07', NOW()),
(45, 'Hồ Thị Nga', 'ngaho@gmail.com', '0978890123', 'active', 'enrolled', 4, 4, 4, 6, true, NULL, '2024-12-30 11:00:00+07', NOW()),
-- Students từ tháng 11/2024
(46, 'Trần Văn Hùng', 'hungtran@gmail.com', '0901234568', 'active', 'enrolled', 1, 1, 1, 5, true, 21, '2024-11-10 10:00:00+07', NOW()),
(47, 'Lê Thị Lan', 'lanle2@gmail.com', '0912345679', 'active', 'enrolled', 2, 2, 3, 6, true, 22, '2024-11-15 14:00:00+07', NOW()),
(48, 'Phạm Văn Minh', 'minhpham@gmail.com', '0923456780', 'active', 'enrolled', 1, 1, 2, 5, true, 23, '2024-11-20 09:00:00+07', NOW()),
(49, 'Hoàng Thị Nga', 'ngahoang2@gmail.com', '0934567891', 'active', 'enrolled', 3, 3, 8, 6, true, 24, '2024-11-25 11:00:00+07', NOW()),
(50, 'Vũ Văn Phong', 'phongvu@gmail.com', '0945678902', 'active', 'enrolled', 4, 4, 4, 5, true, 25, '2024-11-30 15:00:00+07', NOW()),
(51, 'Nguyễn Thị Anh', 'anhnguyen2@gmail.com', '0956789013', 'active', 'enrolled', 1, 1, 1, 5, true, NULL, '2024-11-05 10:00:00+07', NOW()),
(52, 'Trần Văn Bình', 'binhtran2@gmail.com', '0967890124', 'active', 'enrolled', 2, 2, 3, 6, true, NULL, '2024-11-08 14:00:00+07', NOW()),
(53, 'Lê Thị Cường', 'cuongle2@gmail.com', '0978901235', 'active', 'enrolled', 3, 3, 8, 5, true, NULL, '2024-11-12 09:00:00+07', NOW()),
(54, 'Phạm Văn Dung', 'dungpham2@gmail.com', '0989012346', 'active', 'enrolled', 4, 4, 4, 6, true, NULL, '2024-11-18 11:00:00+07', NOW()),
(55, 'Hoàng Thị Em', 'emhoang2@gmail.com', '0990123457', 'active', 'enrolled', 5, 1, 5, 5, true, NULL, '2024-11-22 15:00:00+07', NOW()),
-- Students từ tháng 10/2024
(56, 'Đặng Thị Quỳnh', 'quynhdang@gmail.com', '0901235679', 'active', 'enrolled', 1, 1, 1, 5, true, 26, '2024-10-10 10:00:00+07', NOW()),
(57, 'Bùi Văn Sơn', 'sonbui@gmail.com', '0912346780', 'active', 'enrolled', 2, 2, 3, 6, true, 27, '2024-10-15 14:00:00+07', NOW()),
(58, 'Ngô Thị Tuyết', 'tuyetngo@gmail.com', '0923457891', 'active', 'enrolled', 5, 1, 5, 5, true, 28, '2024-10-20 09:00:00+07', NOW()),
(59, 'Đỗ Văn Uyên', 'uyendo@gmail.com', '0934568902', 'active', 'enrolled', 3, 3, 8, 6, true, 29, '2024-10-25 11:00:00+07', NOW()),
(60, 'Lý Thị Vân', 'vanly@gmail.com', '0945679013', 'active', 'enrolled', 4, 4, 4, 5, true, 30, '2024-10-30 15:00:00+07', NOW()),
(61, 'Võ Văn Anh', 'anhvo2@gmail.com', '0956780124', 'active', 'enrolled', 1, 1, 2, 5, true, NULL, '2024-10-05 10:00:00+07', NOW()),
(62, 'Cao Thị Bích', 'bichcao@gmail.com', '0967891235', 'active', 'enrolled', 2, 2, 3, 6, true, NULL, '2024-10-08 14:00:00+07', NOW()),
(63, 'Dương Văn Cường', 'cuongduong@gmail.com', '0978902346', 'active', 'enrolled', 6, 2, 6, 5, true, NULL, '2024-10-12 09:00:00+07', NOW()),
(64, 'Hồ Thị Dung', 'dungho@gmail.com', '0989013457', 'active', 'enrolled', 3, 3, 8, 6, true, NULL, '2024-10-18 11:00:00+07', NOW()),
(65, 'Kim Văn Em', 'emkim@gmail.com', '0990124568', 'active', 'enrolled', 4, 4, 4, 5, true, NULL, '2024-10-22 15:00:00+07', NOW()),
-- Students từ tháng 9/2024
(66, 'Lưu Thị Phương', 'phuongluu@gmail.com', '0901236789', 'active', 'enrolled', 1, 1, 1, 5, true, 31, '2024-09-10 10:00:00+07', NOW()),
(67, 'Mai Văn Giang', 'giangmai@gmail.com', '0912347890', 'active', 'enrolled', 2, 2, 3, 6, true, 32, '2024-09-15 14:00:00+07', NOW()),
(68, 'Nguyễn Thị Hoa', 'hoanguyen3@gmail.com', '0923458901', 'active', 'enrolled', 6, 2, 6, 5, true, 33, '2024-09-20 09:00:00+07', NOW()),
(69, 'Phan Văn Khoa', 'khoaphan@gmail.com', '0934569012', 'active', 'enrolled', 3, 3, 8, 6, true, 34, '2024-09-25 11:00:00+07', NOW()),
(70, 'Trần Thị Linh', 'linhtran2@gmail.com', '0945670123', 'active', 'enrolled', 4, 4, 4, 5, true, 35, '2024-09-30 15:00:00+07', NOW()),
(71, 'Lê Văn Mạnh', 'manhle2@gmail.com', '0956781234', 'active', 'enrolled', 1, 1, 2, 5, true, NULL, '2024-09-05 10:00:00+07', NOW()),
(72, 'Phạm Thị Nga', 'ngapham2@gmail.com', '0967892345', 'active', 'enrolled', 2, 2, 3, 6, true, NULL, '2024-09-08 14:00:00+07', NOW()),
(73, 'Hoàng Văn Oanh', 'oanhhoang@gmail.com', '0978903456', 'active', 'enrolled', 5, 1, 5, 5, true, NULL, '2024-09-12 09:00:00+07', NOW()),
(74, 'Vũ Thị Phượng', 'phuongvu2@gmail.com', '0989014567', 'active', 'enrolled', 3, 3, 8, 6, true, NULL, '2024-09-18 11:00:00+07', NOW()),
(75, 'Đặng Văn Quang', 'quangdang@gmail.com', '0990125678', 'active', 'enrolled', 4, 4, 4, 5, true, NULL, '2024-09-22 15:00:00+07', NOW()),
-- Students từ tháng 8/2024
(76, 'Bùi Thị Rạng', 'rangbui@gmail.com', '0901237890', 'active', 'enrolled', 1, 1, 1, 5, true, 36, '2024-08-10 10:00:00+07', NOW()),
(77, 'Ngô Văn Sơn', 'sonngo@gmail.com', '0912348901', 'active', 'enrolled', 2, 2, 3, 6, true, 37, '2024-08-15 14:00:00+07', NOW()),
(78, 'Đỗ Thị Tuyết', 'tuyetdo@gmail.com', '0923459012', 'active', 'enrolled', 5, 1, 5, 5, true, 38, '2024-08-20 09:00:00+07', NOW()),
(79, 'Lý Văn Uyên', 'uyenly@gmail.com', '0934560123', 'active', 'enrolled', 3, 3, 8, 6, true, 39, '2024-08-25 11:00:00+07', NOW()),
(80, 'Võ Thị Vân', 'vanvo@gmail.com', '0945671234', 'active', 'enrolled', 4, 4, 4, 5, true, 40, '2024-08-30 15:00:00+07', NOW()),
(81, 'Cao Văn Xuyên', 'xuyencao@gmail.com', '0956782345', 'active', 'enrolled', 1, 1, 2, 5, true, NULL, '2024-08-05 10:00:00+07', NOW()),
(82, 'Dương Thị Yến', 'yenduong@gmail.com', '0967893456', 'active', 'enrolled', 2, 2, 3, 6, true, NULL, '2024-08-08 14:00:00+07', NOW()),
(83, 'Hồ Văn Anh', 'anhho2@gmail.com', '0978904567', 'active', 'enrolled', 6, 2, 6, 5, true, NULL, '2024-08-12 09:00:00+07', NOW()),
(84, 'Kim Thị Bích', 'bichkim@gmail.com', '0989015678', 'active', 'enrolled', 3, 3, 8, 6, true, NULL, '2024-08-18 11:00:00+07', NOW()),
(85, 'Lưu Văn Cường', 'cuongluu@gmail.com', '0990126789', 'active', 'enrolled', 4, 4, 4, 5, true, NULL, '2024-08-22 15:00:00+07', NOW()),
-- Students từ tháng 7/2024
(86, 'Mai Thị Dung', 'dungmai@gmail.com', '0901238901', 'active', 'enrolled', 1, 1, 1, 5, true, 41, '2024-07-10 10:00:00+07', NOW()),
(87, 'Nguyễn Văn Em', 'emnguyen2@gmail.com', '0912349012', 'active', 'enrolled', 2, 2, 3, 6, true, 42, '2024-07-15 14:00:00+07', NOW()),
(88, 'Phan Thị Giang', 'giangphan2@gmail.com', '0923450123', 'active', 'enrolled', 6, 2, 6, 5, true, 43, '2024-07-20 09:00:00+07', NOW()),
(89, 'Trần Văn Hoa', 'hoatran3@gmail.com', '0934561234', 'active', 'enrolled', 3, 3, 8, 6, true, 44, '2024-07-25 11:00:00+07', NOW()),
(90, 'Lê Thị Khoa', 'khoale2@gmail.com', '0945672345', 'active', 'enrolled', 4, 4, 4, 5, true, 45, '2024-07-30 15:00:00+07', NOW()),
(91, 'Phạm Văn Linh', 'linhpham3@gmail.com', '0956783456', 'active', 'enrolled', 1, 1, 2, 5, true, NULL, '2024-07-05 10:00:00+07', NOW()),
(92, 'Hoàng Thị Mạnh', 'manhhoang2@gmail.com', '0967894567', 'active', 'enrolled', 2, 2, 3, 6, true, NULL, '2024-07-08 14:00:00+07', NOW()),
(93, 'Vũ Văn Nga', 'ngavu3@gmail.com', '0978905678', 'active', 'enrolled', 5, 1, 5, 5, true, NULL, '2024-07-12 09:00:00+07', NOW()),
(94, 'Đặng Thị Oanh', 'oanhdang2@gmail.com', '0989016789', 'active', 'enrolled', 3, 3, 8, 6, true, NULL, '2024-07-18 11:00:00+07', NOW()),
(95, 'Bùi Văn Phượng', 'phuongbui2@gmail.com', '0990127890', 'active', 'enrolled', 4, 4, 4, 5, true, NULL, '2024-07-22 15:00:00+07', NOW()),
-- Students từ tháng 6/2024
(96, 'Ngô Thị Quang', 'quangngo2@gmail.com', '0901239012', 'active', 'enrolled', 1, 1, 1, 5, true, 46, '2024-06-10 10:00:00+07', NOW()),
(97, 'Đỗ Văn Rạng', 'rangdo2@gmail.com', '0912340123', 'active', 'enrolled', 2, 2, 3, 6, true, 47, '2024-06-15 14:00:00+07', NOW()),
(98, 'Lý Thị Sơn', 'sonly2@gmail.com', '0923451234', 'active', 'enrolled', 5, 1, 5, 5, true, 48, '2024-06-20 09:00:00+07', NOW()),
(99, 'Võ Văn Tuyết', 'tuyetvo2@gmail.com', '0934562345', 'active', 'enrolled', 3, 3, 8, 6, true, 49, '2024-06-25 11:00:00+07', NOW()),
(100, 'Cao Thị Uyên', 'uyencao@gmail.com', '0945673456', 'active', 'enrolled', 4, 4, 4, 5, true, 50, '2024-06-30 15:00:00+07', NOW()),
(101, 'Dương Văn Vân', 'vanduong@gmail.com', '0956784567', 'active', 'enrolled', 1, 1, 2, 5, true, NULL, '2024-06-05 10:00:00+07', NOW()),
(102, 'Hồ Thị Xuyên', 'xuyenho@gmail.com', '0967895678', 'active', 'enrolled', 2, 2, 3, 6, true, NULL, '2024-06-08 14:00:00+07', NOW()),
(103, 'Kim Văn Yến', 'yenkim@gmail.com', '0978906789', 'active', 'enrolled', 6, 2, 6, 5, true, NULL, '2024-06-12 09:00:00+07', NOW()),
(104, 'Lưu Thị Anh', 'anhluu@gmail.com', '0989017890', 'active', 'enrolled', 3, 3, 8, 6, true, NULL, '2024-06-18 11:00:00+07', NOW()),
(105, 'Mai Văn Bích', 'bichmai@gmail.com', '0990128901', 'active', 'enrolled', 4, 4, 4, 5, true, NULL, '2024-06-22 15:00:00+07', NOW())
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('students_id_seq', (SELECT MAX(id) FROM students));

-- ============================================
-- 8. FORMS (Biểu mẫu)
-- ============================================
INSERT INTO forms (id, name, status, fields, settings, embed_code, created_at, updated_at) VALUES
(1, 'Form Đăng ký IELTS', 'active', 
 '{"fields": [{"name": "fullName", "label": "Họ và tên", "type": "text", "required": true}, {"name": "email", "label": "Email", "type": "email", "required": true}, {"name": "phone", "label": "Số điện thoại", "type": "tel", "required": true}]}'::jsonb,
 '{"redirectUrl": "/thank-you", "notificationEmail": "admin@brainstem.edu.vn"}'::jsonb,
 '<iframe src="https://brainstem.edu.vn/forms/1" width="100%" height="500"></iframe>',
 NOW(), NOW()),
(2, 'Form Đăng ký TOEIC', 'active',
 '{"fields": [{"name": "fullName", "label": "Họ và tên", "type": "text", "required": true}, {"name": "email", "label": "Email", "type": "email", "required": true}, {"name": "phone", "label": "Số điện thoại", "type": "tel", "required": true}, {"name": "currentLevel", "label": "Trình độ hiện tại", "type": "select", "options": ["Beginner", "Intermediate", "Advanced"]}]}'::jsonb,
 '{"redirectUrl": "/thank-you", "notificationEmail": "admin@brainstem.edu.vn"}'::jsonb,
 '<iframe src="https://brainstem.edu.vn/forms/2" width="100%" height="500"></iframe>',
 NOW(), NOW()),
(3, 'Form Tư vấn miễn phí', 'active',
 '{"fields": [{"name": "fullName", "label": "Họ và tên", "type": "text", "required": true}, {"name": "phone", "label": "Số điện thoại", "type": "tel", "required": true}, {"name": "message", "label": "Tin nhắn", "type": "textarea"}]}'::jsonb,
 '{"redirectUrl": "/thank-you", "notificationEmail": "admin@brainstem.edu.vn"}'::jsonb,
 '<iframe src="https://brainstem.edu.vn/forms/3" width="100%" height="500"></iframe>',
 NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('forms_id_seq', (SELECT MAX(id) FROM forms));

-- ============================================
-- 9. MEDIA (Tài liệu/Media)
-- ============================================
INSERT INTO media (id, name, type, url, description, file_size, mime_type, status, created_at, updated_at) VALUES
(1, 'IELTS Sample Test 1', 'document', 'https://brainstem.edu.vn/media/ielts-sample-1.pdf', 'Đề thi mẫu IELTS', 2048000, 'application/pdf', 'active', NOW(), NOW()),
(2, 'TOEIC Listening Guide', 'document', 'https://brainstem.edu.vn/media/toeic-listening.pdf', 'Hướng dẫn luyện nghe TOEIC', 1536000, 'application/pdf', 'active', NOW(), NOW()),
(3, 'Welcome Video', 'video', 'https://brainstem.edu.vn/media/welcome.mp4', 'Video chào mừng học viên', 10485760, 'video/mp4', 'active', NOW(), NOW()),
(4, 'Course Banner', 'image', 'https://brainstem.edu.vn/media/banner.jpg', 'Banner khóa học', 512000, 'image/jpeg', 'active', NOW(), NOW()),
(5, 'Grammar Cheat Sheet', 'document', 'https://brainstem.edu.vn/media/grammar-cheat.pdf', 'Tóm tắt ngữ pháp', 1024000, 'application/pdf', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('media_id_seq', (SELECT MAX(id) FROM media));

-- ============================================
-- KẾT THÚC
-- ============================================
-- Kiểm tra dữ liệu đã được insert
SELECT 
    'channels' as table_name, COUNT(*) as record_count FROM channels
UNION ALL
SELECT 'staff', COUNT(*) FROM staff
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'campaigns', COUNT(*) FROM campaigns
UNION ALL
SELECT 'campaign_channels', COUNT(*) FROM campaign_channels
UNION ALL
SELECT 'leads', COUNT(*) FROM leads
UNION ALL
SELECT 'students', COUNT(*) FROM students
UNION ALL
SELECT 'forms', COUNT(*) FROM forms
UNION ALL
SELECT 'media', COUNT(*) FROM media;

