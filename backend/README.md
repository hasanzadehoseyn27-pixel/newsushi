# NewSushi Backend (FastAPI)

## اجرا محلی

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# مقادیر DATABASE_URL و JWT_SECRET را در .env تنظیم کنید

python -m app.seed          # ساخت جدول‌ها + ادمین اولیه + دیتای نمونه
uvicorn app.main:app --reload --port 8000
```

مستندات تعاملی API: `http://localhost:8000/docs`

## ورود ادمین پیش‌فرض

| کاربری | رمز |
|---|---|
| `superadmin` | `Admin123!` |

⚠️ حتماً بعد از اولین اجرا این رمز را از دیتابیس یا با یک اندپوینت change-password تغییر دهید (فاز بعدی اضافه می‌شود).

## مسیرهای اصلی

| Method | Path | توضیح | نیاز به توکن |
|---|---|---|---|
| GET | `/api/products` | لیست محصولات (فیلتر با `?category_slug=`) | خیر |
| GET | `/api/products/{slug}` | جزئیات یک محصول | خیر |
| POST | `/api/products` | افزودن محصول | ✅ ادمین |
| PATCH | `/api/products/{id}` | ویرایش محصول | ✅ ادمین |
| DELETE | `/api/products/{id}` | حذف محصول | ✅ ادمین |
| GET/POST/PATCH/DELETE | `/api/categories...` | همانند بالا برای دسته‌بندی | آخرین سه‌مورد: ✅ ادمین |
| GET | `/api/settings` | تم رنگی فعال سایت | خیر |
| PUT | `/api/settings` | تغییر تم رنگی سایت | ✅ ادمین |
| POST | `/api/uploads/image` | آپلود تصویر محصول | ✅ ادمین |
| POST | `/api/auth/login` | ورود ادمین، دریافت JWT | خیر |
