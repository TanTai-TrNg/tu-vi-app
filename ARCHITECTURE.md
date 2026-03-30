# Tử Vi App — Kiến trúc hệ thống

## Tổng quan

Web app tử vi Bát Tự phương Đông, phục vụ nhiều user, deploy lên cloud.

```
User (Browser/Mobile)
    ↓ HTTP
┌─────────────────────────────────────────┐
│            tuvi-app                      │
│                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ Frontend │  │   API    │  │   DB   │ │
│  │ Next.js  │→ │ tRPC/API │→ │ Postgres│ │
│  └──────────┘  └──────────┘  └────────┘ │
│                     ↓                    │
│              ┌────────────┐              │
│              │  Core Logic │              │
│              │ (tái sử dụng│              │
│              │  từ mcp-tuvi)│              │
│              └────────────┘              │
└─────────────────────────────────────────┘
```

---

## Cấu trúc thư mục

```
tuvi-app/
├── package.json
├── .env
│
├── src/
│   ├── core/                      ← Logic tính toán (copy từ mcp-tuvi)
│   │   ├── bat-tu.ts              ← Tính 4 trụ, Can Chi
│   │   ├── ngu-hanh.ts            ← Phân tích ngũ hành
│   │   ├── dai-van.ts             ← Tính Đại Vận
│   │   ├── hop-tuoi.ts            ← NEW: So sánh hợp tuổi 2 người
│   │   ├── constants.ts           ← Hằng số Can Chi, Ngũ Hành (từ horoscope-config.ts)
│   │   └── types.ts               ← TypeScript types
│   │
│   ├── api/                       ← REST API hoặc tRPC
│   │   ├── routes/
│   │   │   ├── bat-tu.ts          ← POST /api/bat-tu
│   │   │   ├── ngu-hanh.ts        ← GET  /api/ngu-hanh/:hanh
│   │   │   ├── dai-van.ts         ← POST /api/dai-van
│   │   │   ├── hop-tuoi.ts        ← POST /api/hop-tuoi
│   │   │   └── history.ts         ← GET  /api/history (lịch sử tra cứu)
│   │   ├── middleware/
│   │   │   ├── auth.ts            ← Xác thực user (optional)
│   │   │   └── rate-limit.ts      ← Giới hạn request
│   │   └── index.ts
│   │
│   ├── db/                        ← Database
│   │   ├── schema.ts              ← Drizzle/Prisma schema
│   │   └── migrations/
│   │
│   ├── app/                       ← Frontend (Next.js App Router)
│   │   ├── page.tsx               ← Trang chủ — form nhập ngày sinh
│   │   ├── ket-qua/page.tsx       ← Trang kết quả Bát Tự
│   │   ├── hop-tuoi/page.tsx      ← Trang so sánh hợp tuổi
│   │   ├── lich-su/page.tsx       ← Lịch sử tra cứu
│   │   └── layout.tsx
│   │
│   └── components/                ← UI components
│       ├── BatTuForm.tsx           ← Form nhập ngày giờ sinh
│       ├── BatTuResult.tsx         ← Hiển thị kết quả 4 trụ
│       ├── NguHanhChart.tsx        ← Biểu đồ ngũ hành (radar/bar chart)
│       ├── DaiVanTimeline.tsx      ← Timeline đại vận
│       └── HopTuoiCompare.tsx      ← So sánh 2 người
│
├── public/
│   └── images/                    ← Icon ngũ hành, con giáp
│
└── tests/
    ├── core/                      ← Unit test logic tính toán
    └── api/                       ← Integration test API
```

---

## Tech Stack

| Layer | Công nghệ | Lý do |
|-------|-----------|-------|
| Frontend | Next.js 14+ (App Router) | SSR, SEO tốt, deploy dễ |
| Styling | Tailwind CSS | Nhanh, responsive |
| API | tRPC hoặc Next.js API Routes | Type-safe, không cần REST client |
| Database | PostgreSQL (Supabase free) | Multi-user, truy cập từ xa |
| ORM | Drizzle ORM | Nhẹ, type-safe, dễ migrate |
| Auth | NextAuth.js (optional) | Login Google/GitHub |
| Deploy | Vercel (free) | Zero config, auto deploy |
| Chart | Recharts hoặc Chart.js | Biểu đồ ngũ hành |

---

## Database Schema

```sql
-- User (optional, nếu có auth)
CREATE TABLE users (
  id         TEXT PRIMARY KEY,
  email      TEXT UNIQUE,
  name       TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lịch sử tra cứu
CREATE TABLE lookups (
  id         TEXT PRIMARY KEY,
  user_id    TEXT REFERENCES users(id),
  name       TEXT NOT NULL,              -- Tên người được xem
  birth_date DATE NOT NULL,
  birth_hour INTEGER NOT NULL,
  gender     TEXT NOT NULL,              -- 'nam' | 'nu'
  result     JSONB NOT NULL,            -- Kết quả đầy đủ (cache)
  created_at TIMESTAMP DEFAULT NOW()
);

-- So sánh hợp tuổi
CREATE TABLE comparisons (
  id         TEXT PRIMARY KEY,
  user_id    TEXT REFERENCES users(id),
  person_a   JSONB NOT NULL,            -- {name, birthDate, birthHour, gender}
  person_b   JSONB NOT NULL,
  result     JSONB NOT NULL,            -- Kết quả so sánh
  created_at TIMESTAMP DEFAULT NOW()
);

-- Nội dung diễn giải (giống horoscope_ngu_hanh, horoscope_dia_chi)
CREATE TABLE interpretations (
  category   TEXT NOT NULL,             -- 'ngu_hanh' | 'dia_chi' | 'dai_van'
  key        TEXT NOT NULL,
  content    JSONB NOT NULL,            -- Nội dung diễn giải đầy đủ
  PRIMARY KEY (category, key)
);
```

---

## API Endpoints

| Method | Endpoint | Input | Output |
|--------|----------|-------|--------|
| POST | `/api/bat-tu` | `{ngay, thang, nam, gio, gioiTinh}` | Bát Tự đầy đủ + phân tích |
| GET | `/api/ngu-hanh/:hanh` | param: Mộc/Hỏa/Thổ/Kim/Thủy | Ý nghĩa ngũ hành |
| POST | `/api/dai-van` | `{namSinh, gioiTinh}` | 8 Đại Vận |
| POST | `/api/hop-tuoi` | `{personA, personB}` | So sánh hợp tuổi/mệnh |
| GET | `/api/history` | query: userId | Lịch sử tra cứu |

---

## Tái sử dụng từ mcp-tuvi

```
mcp-tuvi (nguồn)                    tuvi-app (đích)
═══════════════                     ═══════════════
src/data/horoscope-config.ts   →    src/core/constants.ts
  THIEN_CAN, DIA_CHI                  (copy nguyên)
  NGU_HANH_*, TUONG_SINH/KHAC
  GIO_DIA_CHI

src/tools/horoscope.ts         →    src/core/bat-tu.ts
  tinhCanNam, tinhChiNam              (tách logic ra, bỏ MCP wrapper)
  tinhCanThang, tinhChiThang
  tinhCanNgay, tinhChiNgay
  tinhCanGio, tinhChiGio
  phanTichNguHanh

src/db/migrations/001_init.sql →    src/db/migrations/
  horoscope_ngu_hanh                  interpretations table
  horoscope_dia_chi                   (gộp thành 1 bảng linh hoạt hơn)
```

---

## Tính năng theo giai đoạn

### Phase 1: MVP
- [ ] Form nhập ngày giờ sinh
- [ ] Tính Bát Tự + hiển thị kết quả
- [ ] Biểu đồ ngũ hành
- [ ] Deploy lên Vercel

### Phase 2: Mở rộng
- [ ] Xem Đại Vận với timeline trực quan
- [ ] So sánh hợp tuổi 2 người
- [ ] Lưu lịch sử tra cứu
- [ ] Auth (login Google)

### Phase 3: Nâng cao
- [ ] AI diễn giải (gọi Claude API để phân tích sâu)
- [ ] Chia sẻ kết quả qua link
- [ ] PWA (dùng offline)
- [ ] Đa ngôn ngữ (Việt/Anh)
