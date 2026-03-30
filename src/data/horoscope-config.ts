// ==========================================
// Config data cho Tử Vi Bát Tự
// Tất cả data tham chiếu đều nằm ở đây
// Muốn chỉnh sửa ý nghĩa, chỉ cần sửa file này
// ==========================================

// 10 Thiên Can
export const THIEN_CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"] as const
export type ThienCan = typeof THIEN_CAN[number]

// 12 Địa Chi
export const DIA_CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"] as const
export type DiaChi = typeof DIA_CHI[number]

// Ngũ Hành của từng Thiên Can
export const NGU_HANH_THIEN_CAN: Record<ThienCan, string> = {
    "Giáp": "Mộc", "Ất": "Mộc",
    "Bính": "Hỏa", "Đinh": "Hỏa",
    "Mậu": "Thổ", "Kỷ": "Thổ",
    "Canh": "Kim", "Tân": "Kim",
    "Nhâm": "Thủy", "Quý": "Thủy",
}

// Ngũ Hành của từng Địa Chi
export const NGU_HANH_DIA_CHI: Record<DiaChi, string> = {
    "Tý": "Thủy", "Sửu": "Thổ",
    "Dần": "Mộc", "Mão": "Mộc",
    "Thìn": "Thổ", "Tỵ": "Hỏa",
    "Ngọ": "Hỏa", "Mùi": "Thổ",
    "Thân": "Kim", "Dậu": "Kim",
    "Tuất": "Thổ", "Hợi": "Thủy",
}

// Âm Dương của từng Thiên Can
// Giáp/Bính/Mậu/Canh/Nhâm = Dương | Ất/Đinh/Kỷ/Tân/Quý = Âm
export const AM_DUONG_THIEN_CAN: Record<ThienCan, "Dương" | "Âm"> = {
    "Giáp": "Dương", "Ất": "Âm",
    "Bính": "Dương", "Đinh": "Âm",
    "Mậu": "Dương", "Kỷ": "Âm",
    "Canh": "Dương", "Tân": "Âm",
    "Nhâm": "Dương", "Quý": "Âm",
}

// Sinh khắc ngũ hành
// Tương sinh: Mộc→Hỏa→Thổ→Kim→Thủy→Mộc
// Tương khắc: Mộc→Thổ, Thổ→Thủy, Thủy→Hỏa, Hỏa→Kim, Kim→Mộc
export const TUONG_SINH: Record<string, string> = {
    "Mộc": "Hỏa",   // Mộc sinh Hỏa
    "Hỏa": "Thổ",   // Hỏa sinh Thổ
    "Thổ": "Kim",   // Thổ sinh Kim
    "Kim": "Thủy",  // Kim sinh Thủy
    "Thủy": "Mộc",  // Thủy sinh Mộc
}

export const TUONG_KHAC: Record<string, string> = {
    "Mộc": "Thổ",   // Mộc khắc Thổ
    "Thổ": "Thủy",  // Thổ khắc Thủy
    "Thủy": "Hỏa",  // Thủy khắc Hỏa
    "Hỏa": "Kim",   // Hỏa khắc Kim
    "Kim": "Mộc",   // Kim khắc Mộc
}

// Ý nghĩa ngũ hành trong tính cách
// TODO: Bổ sung nội dung chi tiết hơn
export const Y_NGHIA_NGU_HANH: Record<string, { tinhCach: string; sucKhoe: string; ngheNghiep: string }> = {
    "Mộc": {
        tinhCach: "Nhân từ, hay giúp đỡ, có chí tiến thủ, đôi khi cứng đầu",
        sucKhoe: "Chú ý gan, mật, tay chân",
        ngheNghiep: "Giáo dục, y tế, nông nghiệp, môi trường",
    },
    "Hỏa": {
        tinhCach: "Nhiệt tình, sáng tạo, quyết đoán, dễ nóng giận",
        sucKhoe: "Chú ý tim, huyết áp, mắt",
        ngheNghiep: "Nghệ thuật, truyền thông, kinh doanh, lãnh đạo",
    },
    "Thổ": {
        tinhCach: "Trung thực, kiên nhẫn, đáng tin cậy, đôi khi bảo thủ",
        sucKhoe: "Chú ý tỳ vị, tiêu hóa",
        ngheNghiep: "Bất động sản, xây dựng, tài chính, quản lý",
    },
    "Kim": {
        tinhCach: "Cương trực, quyết đoán, có nguyên tắc, đôi khi lạnh lùng",
        sucKhoe: "Chú ý phổi, hô hấp, da",
        ngheNghiep: "Luật pháp, quân sự, kỹ thuật, tài chính",
    },
    "Thủy": {
        tinhCach: "Thông minh, linh hoạt, sâu sắc, đôi khi thiếu quyết đoán",
        sucKhoe: "Chú ý thận, bàng quang, xương",
        ngheNghiep: "Nghiên cứu, triết học, tâm lý, du lịch",
    },
}

// Ý nghĩa 12 Địa Chi (con giáp)
// TODO: Bổ sung nội dung chi tiết hơn
export const Y_NGHIA_DIA_CHI: Record<DiaChi, { tuoi: string; tinhCach: string }> = {
    "Tý": { tuoi: "Chuột", tinhCach: "Thông minh, nhanh nhẹn, khéo léo" },
    "Sửu": { tuoi: "Trâu", tinhCach: "Cần cù, kiên nhẫn, đáng tin cậy" },
    "Dần": { tuoi: "Hổ", tinhCach: "Dũng cảm, nhiệt huyết, có chí khí" },
    "Mão": { tuoi: "Mèo", tinhCach: "Khéo léo, nhạy cảm, thích sự hòa bình" },
    "Thìn": { tuoi: "Rồng", tinhCach: "Mạnh mẽ, tự tin, có chí lớn" },
    "Tỵ": { tuoi: "Rắn", tinhCach: "Sâu sắc, khôn ngoan, bí ẩn" },
    "Ngọ": { tuoi: "Ngựa", tinhCach: "Tự do, nhiệt tình, thích phiêu lưu" },
    "Mùi": { tuoi: "Dê", tinhCach: "Hiền lành, nghệ sĩ, nhạy cảm" },
    "Thân": { tuoi: "Khỉ", tinhCach: "Thông minh, linh hoạt, hài hước" },
    "Dậu": { tuoi: "Gà", tinhCach: "Cẩn thận, chăm chỉ, có trách nhiệm" },
    "Tuất": { tuoi: "Chó", tinhCach: "Trung thành, chính trực, bảo vệ" },
    "Hợi": { tuoi: "Lợn", tinhCach: "Hào phóng, chân thành, yêu hòa bình" },
}

// 12 cung Đại Vận (mỗi cung 10 năm)
// TODO: Bổ sung logic tính Đại Vận thật theo giới tính và năm sinh
export const DAI_VAN_LABELS = [
    "Khởi vận", "Thiếu vận", "Thanh vận", "Tráng vận",
    "Thịnh vận", "Trung vận", "Thành vận", "Lão vận",
    "Mãn vận", "Chung vận", "Phúc vận", "Thọ vận",
] as const

// Giờ sinh → Địa Chi giờ
// Mỗi Địa Chi giờ ứng với 2 tiếng đồng hồ
export const GIO_DIA_CHI: Array<{ from: number; to: number; diaChi: DiaChi }> = [
    { from: 23, to: 1, diaChi: "Tý" },
    { from: 1, to: 3, diaChi: "Sửu" },
    { from: 3, to: 5, diaChi: "Dần" },
    { from: 5, to: 7, diaChi: "Mão" },
    { from: 7, to: 9, diaChi: "Thìn" },
    { from: 9, to: 11, diaChi: "Tỵ" },
    { from: 11, to: 13, diaChi: "Ngọ" },
    { from: 13, to: 15, diaChi: "Mùi" },
    { from: 15, to: 17, diaChi: "Thân" },
    { from: 17, to: 19, diaChi: "Dậu" },
    { from: 19, to: 21, diaChi: "Tuất" },
    { from: 21, to: 23, diaChi: "Hợi" },
]
