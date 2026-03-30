-- Migration 001: Schema tử vi
-- Bảng diễn giải ngũ hành và địa chi

CREATE TABLE IF NOT EXISTS horoscope_ngu_hanh (
  ngu_hanh    TEXT PRIMARY KEY,
  tinh_cach   TEXT NOT NULL DEFAULT '',
  suc_khoe    TEXT NOT NULL DEFAULT '',
  nghe_nghiep TEXT NOT NULL DEFAULT '',
  bo_sung     TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS horoscope_dia_chi (
  dia_chi    TEXT PRIMARY KEY,
  con_giap   TEXT NOT NULL DEFAULT '',
  tinh_cach  TEXT NOT NULL DEFAULT '',
  su_nghiep  TEXT NOT NULL DEFAULT '',
  tinh_yeu   TEXT NOT NULL DEFAULT '',
  may_man    TEXT NOT NULL DEFAULT '',
  bo_sung    TEXT NOT NULL DEFAULT ''
);

-- Seed data Ngũ Hành
INSERT OR IGNORE INTO horoscope_ngu_hanh (ngu_hanh, tinh_cach, suc_khoe, nghe_nghiep) VALUES
  ('Mộc',  'Nhân từ, hay giúp đỡ, có chí tiến thủ, đôi khi cứng đầu',    'Chú ý gan, mật, tay chân',         'Giáo dục, y tế, nông nghiệp, môi trường'),
  ('Hỏa',  'Nhiệt tình, sáng tạo, quyết đoán, dễ nóng giận',              'Chú ý tim, huyết áp, mắt',          'Nghệ thuật, truyền thông, kinh doanh, lãnh đạo'),
  ('Thổ',  'Trung thực, kiên nhẫn, đáng tin cậy, đôi khi bảo thủ',        'Chú ý tỳ vị, tiêu hóa',             'Bất động sản, xây dựng, tài chính, quản lý'),
  ('Kim',  'Cương trực, quyết đoán, có nguyên tắc, đôi khi lạnh lùng',    'Chú ý phổi, hô hấp, da',            'Luật pháp, quân sự, kỹ thuật, tài chính'),
  ('Thủy', 'Thông minh, linh hoạt, sâu sắc, đôi khi thiếu quyết đoán',   'Chú ý thận, bàng quang, xương',     'Nghiên cứu, triết học, tâm lý, du lịch');

-- Seed data Địa Chi
INSERT OR IGNORE INTO horoscope_dia_chi (dia_chi, con_giap, tinh_cach) VALUES
  ('Tý',   'Chuột', 'Thông minh, nhanh nhẹn, khéo léo'),
  ('Sửu',  'Trâu',  'Cần cù, kiên nhẫn, đáng tin cậy'),
  ('Dần',  'Hổ',    'Dũng cảm, nhiệt huyết, có chí khí'),
  ('Mão',  'Mèo',   'Khéo léo, nhạy cảm, thích sự hòa bình'),
  ('Thìn', 'Rồng',  'Mạnh mẽ, tự tin, có chí lớn'),
  ('Tỵ',   'Rắn',   'Sâu sắc, khôn ngoan, bí ẩn'),
  ('Ngọ',  'Ngựa',  'Tự do, nhiệt tình, thích phiêu lưu'),
  ('Mùi',  'Dê',    'Hiền lành, nghệ sĩ, nhạy cảm'),
  ('Thân', 'Khỉ',   'Thông minh, linh hoạt, hài hước'),
  ('Dậu',  'Gà',    'Cẩn thận, chăm chỉ, có trách nhiệm'),
  ('Tuất', 'Chó',   'Trung thành, chính trực, bảo vệ'),
  ('Hợi',  'Lợn',   'Hào phóng, chân thành, yêu hòa bình');
