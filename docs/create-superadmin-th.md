# สร้าง Super Admin User คนแรก

ทำตามขั้นตอนนี้เพื่อสร้างบัญชี Super Admin คนแรกและใช้ล็อกอินที่หน้า `armai.pages.dev/login`

---

## ขั้นตอนที่ 1: สร้าง User ใน Supabase

1. เข้า **Supabase Dashboard** → เลือกโปรเจกต์ของ ArmAI  
   (https://supabase.com/dashboard)

2. ไปที่เมนู **Authentication** → **Users**

3. กดปุ่ม **Add user** → **Create new user**

4. กรอก:
   - **Email:** อีเมลที่ใช้ล็อกอิน (เช่น `admin@armai.com`)
   - **Password:** รหัสผ่านที่ต้องการ (ต้องยาวอย่างน้อย 6 ตัว)
   - (ถ้ามีช่อง **Auto Confirm User** ให้ติ๊กให้ถูกต้อง เพื่อให้ล็อกอินได้เลยโดยไม่ต้องยืนยันอีเมล)

5. กด **Create user**

6. **จด User UID (UUID)** ของ user ที่สร้าง:
   - หลังสร้างแล้วจะเห็นรายการ user ในตาราง
   - คลิกที่ user นั้น หรือดูคอลัมน์ **UID** — เป็นค่าแบบ `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **คัดลอก UID ไว้** ใช้ในขั้นตอนถัดไป

---

## ขั้นตอนที่ 2: ตั้ง Role เป็น super_admin ในฐานข้อมูล

1. ใน Supabase Dashboard ไปที่ **SQL Editor**

2. กด **New query**

3. วางคำสั่ง SQL ด้านล่าง แล้ว**แทนที่ `YOUR_USER_UUID` ด้วย UID ที่จดไว้** (และเปลี่ยนอีเมล/ชื่อถ้าต้องการ):

```sql
insert into public.profiles (id, email, full_name, role)
values (
  'YOUR_USER_UUID',
  'admin@armai.com',
  'Super Admin',
  'super_admin'
)
on conflict (id) do update set
  role = 'super_admin',
  email = excluded.email,
  full_name = excluded.full_name,
  updated_at = now();
```

4. กด **Run** (หรือ Ctrl+Enter)

5. ควรเห็นข้อความแบบ "Success. No rows returned" หรือจำนวนแถวที่อัปเดต

---

## ขั้นตอนที่ 3: ล็อกอินที่หน้า ArmAI

1. เปิด **https://armai.pages.dev/login** (หรือโดเมนที่ deploy ไว้)

2. กรอก **Email** และ **Password** ตามที่สร้างในขั้นตอนที่ 1

3. กด **Sign in**

4. หลังล็อกอินสำเร็จ ระบบจะพาไปหน้า **Super Admin Dashboard** (เพราะ role เป็น `super_admin`)

---

## ถ้าตาราง profiles ยังไม่มีแถวของ user นี้

ถ้าในขั้นตอนที่ 2 ใช้แค่ `insert` แล้วมี error แบบ conflict กับคีย์หลัก ให้ใช้คำสั่งนี้แทน (ใช้ได้ทั้งกรณีมีแถวอยู่แล้วหรือยังไม่มี):

```sql
insert into public.profiles (id, email, full_name, role)
values (
  'YOUR_USER_UUID',
  'admin@armai.com',
  'Super Admin',
  'super_admin'
)
on conflict (id) do update set
  role = 'super_admin',
  email = excluded.email,
  full_name = excluded.full_name,
  updated_at = now();
```

---

## สรุปสั้น ๆ

| ขั้น | ทำที่ไหน | ทำอะไร |
|-----|-----------|--------|
| 1 | Supabase → Authentication → Users | สร้าง user (อีเมล + รหัสผ่าน) แล้วจด **UID** |
| 2 | Supabase → SQL Editor | รัน SQL ใส่/อัปเดต `profiles` ให้ `role = 'super_admin'` โดยใช้ UID นั้น |
| 3 | armai.pages.dev/login | ล็อกอินด้วยอีเมลและรหัสผ่านที่สร้าง → เข้า Super Dashboard |

เสร็จแล้วคุณจะมี Super Admin user คนแรกและล็อกอินได้ที่หน้ารันแล้ว
