# NewSushi (新寿司)

فروشگاه اینترنتی سوشی — سه‌زبانه (فارسی/انگلیسی/ژاپنی)، سئو-محور، با تجربه بصری متحرک و پنل ادمین.

## ساختار پروژه

```
newsushi/
├── frontend/   Next.js 16 (App Router) + TypeScript + Tailwind v4
└── backend/    FastAPI (بعداً اضافه می‌شود)
```

## وضعیت فعلی (فاز ۱ — اسکلت)

- [x] راه‌اندازی Next.js + next-intl (fa/en/ja) با RTL/LTR خودکار
- [x] سیستم تم: حالت روز/شب + ۵ پالت رنگی سوییچ‌پذیر (Ai / Wasabi / Akane / Yuzu / Murasaki)
- [x] پس‌زمینه ستاره‌ای تعاملی سه‌بعدی (Three.js)
- [x] کارت محصول با ۵ الگوی انیمیشن متفاوت
- [x] فونت‌های self-host شده (بدون فراخوانی زنده به Google Fonts)
- [ ] صفحه اختصاصی محصول با اسلایدر تصاویر سه‌بعدی
- [ ] بک‌اند FastAPI + دیتابیس PostgreSQL
- [ ] پنل ادمین (مدیریت محصولات، دسته‌بندی، انتخاب انیمیشن و تم رنگی)

## اجرای فرانت‌اند

```bash
cd frontend
npm install
npm run dev
```

## اجرای بک‌اند

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m app.seed
uvicorn app.main:app --reload --port 8000
```

جزئیات کامل در [backend/README.md](backend/README.md)
