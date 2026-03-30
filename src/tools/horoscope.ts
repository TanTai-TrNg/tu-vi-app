// ==========================================
// Tool Tử Vi Bát Tự Phương Đông
//
// Bát Tự = 4 trụ × 2 chữ (Can + Chi) = 8 chữ
//   Trụ Năm   = Can Năm  + Chi Năm
//   Trụ Tháng = Can Tháng + Chi Tháng
//   Trụ Ngày  = Can Ngày  + Chi Ngày
//   Trụ Giờ   = Can Giờ   + Chi Giờ
//
// TODO: Logic tính Can/Chi tháng và giờ cần hoàn thiện
//       theo bảng Bát Tự truyền thống (ngày tiết khí)
// ==========================================

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
    THIEN_CAN, DIA_CHI,
    NGU_HANH_THIEN_CAN, NGU_HANH_DIA_CHI,
    AM_DUONG_THIEN_CAN,
    TUONG_SINH, TUONG_KHAC,
    GIO_DIA_CHI,
    type ThienCan, type DiaChi,
} from "../data/horoscope-config.js"
import db from "../db/database.js"

// Đọc diễn giải từ DB — linh hoạt hơn, chỉnh sửa không cần restart server
function getNguHanhInfo(nguHanh: string) {
    return db.prepare("SELECT * FROM horoscope_ngu_hanh WHERE ngu_hanh = ?").get(nguHanh) as
        { tinh_cach: string; suc_khoe: string; nghe_nghiep: string; bo_sung: string } | undefined
}

function getDiaChiInfo(diaChi: string) {
    return db.prepare("SELECT * FROM horoscope_dia_chi WHERE dia_chi = ?").get(diaChi) as
        { con_giap: string; tinh_cach: string; su_nghiep: string; tinh_yeu: string; may_man: string; bo_sung: string } | undefined
}

// ==========================================
// Logic tính Can Chi
// ==========================================

// Tính Thiên Can năm: (năm - 4) % 10
// VD: 1996 → (1996-4)%10 = 2 → THIEN_CAN[2] = "Bính"
function tinhCanNam(nam: number): ThienCan {
    return THIEN_CAN[(nam - 4 + 400) % 10] as ThienCan
}

// Tính Địa Chi năm: (năm - 4) % 12
// VD: 1996 → (1996-4)%12 = 0 → DIA_CHI[0] = "Tý"
function tinhChiNam(nam: number): DiaChi {
    return DIA_CHI[(nam - 4 + 400) % 12] as DiaChi
}

// TODO: Can Tháng cần bảng tra theo Can Năm × Tháng (ngũ hổ độn nguyệt)
// Hiện tại dùng công thức đơn giản hóa
function tinhCanThang(thang: number, canNam: ThienCan): ThienCan {
    const canNamIndex = THIEN_CAN.indexOf(canNam)
    const nhomBatDau = [0, 2, 4, 6, 8]
    const nhom = Math.floor(canNamIndex / 2)
    const batDau = nhomBatDau[nhom % 5] ?? 0
    return THIEN_CAN[(batDau + thang - 1 + 10) % 10] as ThienCan
}

// TODO: Chi Tháng cần theo lịch âm (tháng Dần = tháng 1 âm lịch)
// Hiện tại dùng dương lịch đơn giản hóa
function tinhChiThang(thang: number): DiaChi {
    const chiIndex = (thang + 0) % 12
    return DIA_CHI[chiIndex] as DiaChi
}

// TODO: Can Ngày cần công thức Julian Day Number chuẩn
// Đây là phần phức tạp nhất — cần bổ sung sau
function tinhCanNgay(ngay: number, thang: number, nam: number): ThienCan {
    const a = Math.floor((14 - thang) / 12)
    const y = nam + 4800 - a
    const m = thang + 12 * a - 3
    const jdn = ngay + Math.floor((153 * m + 2) / 5) + 365 * y
        + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
    return THIEN_CAN[jdn % 10] as ThienCan
}

function tinhChiNgay(ngay: number, thang: number, nam: number): DiaChi {
    const a = Math.floor((14 - thang) / 12)
    const y = nam + 4800 - a
    const m = thang + 12 * a - 3
    const jdn = ngay + Math.floor((153 * m + 2) / 5) + 365 * y
        + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
    return DIA_CHI[jdn % 12] as DiaChi
}

// Địa Chi giờ theo bảng GIO_DIA_CHI
function tinhChiGio(gio: number): DiaChi {
    for (const entry of GIO_DIA_CHI) {
        if (entry.from > entry.to) {
            if (gio >= entry.from || gio < entry.to) return entry.diaChi
        } else {
            if (gio >= entry.from && gio < entry.to) return entry.diaChi
        }
    }
    return "Tý"
}

// TODO: Can Giờ cần bảng tra theo Can Ngày × Giờ (ngũ thử độn thời)
function tinhCanGio(chiGio: DiaChi, canNgay: ThienCan): ThienCan {
    const canNgayIndex = THIEN_CAN.indexOf(canNgay)
    const chiGioIndex = DIA_CHI.indexOf(chiGio)
    const nhom = Math.floor(canNgayIndex / 2)
    const batDau = [0, 2, 4, 6, 8][nhom % 5] ?? 0
    return THIEN_CAN[(batDau + chiGioIndex) % 10] as ThienCan
}

// Đếm ngũ hành trong 8 chữ
function phanTichNguHanh(batTu: Array<{ can: ThienCan; chi: DiaChi }>) {
    const dem: Record<string, number> = { Mộc: 0, Hỏa: 0, Thổ: 0, Kim: 0, Thủy: 0 }
    for (const { can, chi } of batTu) {
        dem[NGU_HANH_THIEN_CAN[can]]!++
        dem[NGU_HANH_DIA_CHI[chi]]!++
    }
    const entries = Object.entries(dem) as Array<[string, number]>
    const manh  = entries.reduce((a, b) => a[1] >= b[1] ? a : b)[0]
    const yeu   = entries.reduce((a, b) => a[1] <= b[1] ? a : b)[0]
    const canBo = TUONG_SINH[yeu] ?? yeu
    return { dem, manh, yeu, canBo }
}

// ==========================================
// Đăng ký Tools Tử Vi
// ==========================================
export function registerHoroscopeTools(server: McpServer) {

    // --- Tool 1: tinh_bat_tu ---
    // Tính đầy đủ Bát Tự + phân tích ngũ hành
    server.tool(
        "tuvi_tinh_bat_tu",
        "Tính Bát Tự (Tứ Trụ) theo ngày giờ sinh — trả về 4 trụ và phân tích ngũ hành bản mệnh",
        {
            ngay:     z.number().min(1).max(31).describe("Ngày sinh (1-31)"),
            thang:    z.number().min(1).max(12).describe("Tháng sinh (1-12)"),
            nam:      z.number().min(1900).max(2100).describe("Năm sinh, VD: 1996"),
            gio:      z.number().min(0).max(23).describe("Giờ sinh theo 24h, VD: 14 = 2 giờ chiều"),
            gioiTinh: z.enum(["nam", "nu"]).describe("Giới tính: nam hoặc nu"),
        },
        async (args) => {
            const { ngay, thang, nam, gio, gioiTinh } = args

            // Tính 4 trụ
            const canNam   = tinhCanNam(nam)
            const chiNam   = tinhChiNam(nam)
            const canThang = tinhCanThang(thang, canNam)
            const chiThang = tinhChiThang(thang)
            const canNgay  = tinhCanNgay(ngay, thang, nam)
            const chiNgay  = tinhChiNgay(ngay, thang, nam)
            const chiGio   = tinhChiGio(gio)
            const canGio   = tinhCanGio(chiGio, canNgay)

            const batTu = [
                { tru: "Năm",   can: canNam,   chi: chiNam   },
                { tru: "Tháng", can: canThang, chi: chiThang },
                { tru: "Ngày",  can: canNgay,  chi: chiNgay  },
                { tru: "Giờ",   can: canGio,   chi: chiGio   },
            ]

            const nguHanhMenh = NGU_HANH_THIEN_CAN[canNgay]
            const amDuong     = AM_DUONG_THIEN_CAN[canNgay]
            const phanTich    = phanTichNguHanh(batTu)
            const conGiap     = getDiaChiInfo(chiNam)
            const yNghia      = getNguHanhInfo(nguHanhMenh)
            const nguHanhSinh = Object.entries(TUONG_SINH).find(([_, v]) => v === nguHanhMenh)?.[0] ?? ""
            const nguHanhKhac = TUONG_KHAC[nguHanhMenh] ?? ""

            const result = [
                "╔══════════════════════════════════════╗",
                "║          BÁT TỰ TỨ TRỤ               ║",
                "╚══════════════════════════════════════╝",
                "",
                `Ngày sinh: ${ngay}/${thang}/${nam} - ${gio}:00 (${gioiTinh === "nam" ? "Nam" : "Nữ"})`,
                "",
                "TỨ TRỤ:",
                ...batTu.map((t) =>
                    `  ${t.tru.padEnd(6)}: ${t.can} ${t.chi}  (${NGU_HANH_THIEN_CAN[t.can]} / ${NGU_HANH_DIA_CHI[t.chi]})`
                ),
                "",
                "BẢN MỆNH:",
                `  Nhật Chủ (Can Ngày): ${canNgay} — ${amDuong} ${nguHanhMenh}`,
                `  Tuổi: ${chiNam} (${conGiap?.con_giap ?? ""})`,
                `  Tính cách: ${conGiap?.tinh_cach ?? ""}`,
                "",
                "NGŨ HÀNH PHÂN BỐ:",
                ...Object.entries(phanTich.dem).map(([k, v]) =>
                    `  ${k}: ${"█".repeat(v)}${"░".repeat(8 - v)} (${v}/8)`
                ),
                `  Mạnh nhất : ${phanTich.manh}`,
                `  Yếu nhất  : ${phanTich.yeu}`,
                `  Cần bổ sung: ${phanTich.canBo}`,
                "",
                `PHÂN TÍCH BẢN MỆNH ${nguHanhMenh.toUpperCase()}:`,
                `  Tính cách : ${yNghia?.tinh_cach ?? ""}`,
                `  Sức khỏe  : ${yNghia?.suc_khoe ?? ""}`,
                `  Nghề nghiệp: ${yNghia?.nghe_nghiep ?? ""}`,
                "",
                "TƯƠNG QUAN NGŨ HÀNH:",
                `  ${nguHanhSinh} sinh ${nguHanhMenh}`,
                `  ${nguHanhMenh} khắc ${nguHanhKhac}`,
                "",
                "⚠️  Logic Can/Chi tháng và ngày đang đơn giản hóa.",
                "    Cần bổ sung bảng tra chuẩn để có kết quả chính xác.",
            ].join("\n")

            return { content: [{ type: "text" as const, text: result }] }
        },
    )

    // --- Tool 2: xem_ngu_hanh ---
    // Tra cứu ý nghĩa một ngũ hành
    server.tool(
        "tuvi_xem_ngu_hanh",
        "Tra cứu ý nghĩa và tương sinh tương khắc của một ngũ hành",
        {
            nguHanh: z.enum(["Mộc", "Hỏa", "Thổ", "Kim", "Thủy"]).describe("Ngũ hành cần tra"),
        },
        async (args) => {
            const { nguHanh } = args
            const yNghia  = getNguHanhInfo(nguHanh)
            const sinh    = Object.entries(TUONG_SINH).find(([_, v]) => v === nguHanh)?.[0] ?? ""
            const sinhRa  = TUONG_SINH[nguHanh] ?? ""
            const khac    = Object.entries(TUONG_KHAC).find(([_, v]) => v === nguHanh)?.[0] ?? ""
            const khacRa  = TUONG_KHAC[nguHanh] ?? ""

            const result = [
                `NGŨ HÀNH: ${nguHanh.toUpperCase()}`,
                "",
                `Tính cách : ${yNghia?.tinh_cach ?? ""}`,
                `Sức khỏe  : ${yNghia?.suc_khoe ?? ""}`,
                `Nghề nghiệp: ${yNghia?.nghe_nghiep ?? ""}`,
                "",
                "Tương sinh:",
                `  ${sinh} → sinh ra ${nguHanh}`,
                `  ${nguHanh} → sinh ra ${sinhRa}`,
                "",
                "Tương khắc:",
                `  ${khac} → khắc ${nguHanh}`,
                `  ${nguHanh} → khắc ${khacRa}`,
            ].join("\n")

            return { content: [{ type: "text" as const, text: result }] }
        },
    )

    // --- Tool 3: xem_tuoi ---
    // Tra cứu thông tin năm sinh (con giáp)
    server.tool(
        "tuvi_xem_tuoi",
        "Xem thông tin tuổi, can chi và tính cách theo năm sinh",
        {
            nam: z.number().min(1900).max(2100).describe("Năm sinh, VD: 1996"),
        },
        async (args) => {
            const chiNam  = tinhChiNam(args.nam)
            const canNam  = tinhCanNam(args.nam)
            const info    = getDiaChiInfo(chiNam)
            const nguHanh = NGU_HANH_DIA_CHI[chiNam]
            const amDuong = AM_DUONG_THIEN_CAN[canNam]

            const result = [
                `TUỔI: ${canNam} ${chiNam} (${args.nam})`,
                "",
                `Con giáp : ${info?.con_giap ?? ""}`,
                `Ngũ hành : ${nguHanh}`,
                `Âm Dương : ${amDuong}`,
                `Tính cách: ${info?.tinh_cach ?? ""}`,
            ].join("\n")

            return { content: [{ type: "text" as const, text: result }] }
        },
    )

    // --- Tool 4: xem_dai_van ---
    // Xem khung Đại Vận 10 năm một
    // TODO: Tính khởi vận chính xác từ ngày tiết khí gần nhất
    server.tool(
        "tuvi_xem_dai_van",
        "Xem khung Đại Vận (mỗi vận 10 năm) theo năm sinh và giới tính",
        {
            namSinh:  z.number().min(1900).max(2100).describe("Năm sinh"),
            gioiTinh: z.enum(["nam", "nu"]).describe("Giới tính"),
        },
        async (args) => {
            const { namSinh, gioiTinh } = args
            const canNam  = tinhCanNam(namSinh)
            const amDuong = AM_DUONG_THIEN_CAN[canNam]

            // TODO: Khởi vận phụ thuộc ngày tiết khí — hiện tại mặc định 5 tuổi
            const khoiVan = 5

            const lines = [
                `ĐẠI VẬN — ${canNam} (${amDuong}) — ${gioiTinh === "nam" ? "Nam" : "Nữ"}`,
                `Khởi vận: ${khoiVan} tuổi (mỗi vận 10 năm)`,
                "",
            ]

            for (let i = 0; i < 8; i++) {
                const tuoiBatDau = khoiVan + i * 10
                const namBatDau  = namSinh + tuoiBatDau
                // TODO: Tính Can Chi Đại Vận chuẩn theo bảng
                const canVan = THIEN_CAN[(THIEN_CAN.indexOf(canNam) + i) % 10]
                lines.push(`  Vận ${i + 1}: ${tuoiBatDau}–${tuoiBatDau + 9} tuổi  (${namBatDau}–${namBatDau + 9})  — ${canVan}`)
            }

            lines.push("")
            lines.push("⚠️  Cần bổ sung ngày tiết khí để tính khởi vận chính xác.")

            return { content: [{ type: "text" as const, text: lines.join("\n") }] }
        },
    )
}
