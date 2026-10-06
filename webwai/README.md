# WEBWAI — เว็บไซต์หลักและ Demo แยกเว็บ

## จุดแก้ไขแต่ละเว็บไซต์ (branch webwai-main)

| เว็บไซต์ | โฟลเดอร์ต้นฉบับ | URL สาธารณะ |
| --- | --- | --- |
| WEBWAI | `webwai/` | https://Piyaidea.github.io/Ai-Demo-Portfolio-piyaidea/webwai/ |
| DAYNEST | `demos/daynest/` (อยู่นอก webwai) | https://Piyaidea.github.io/Ai-Demo-Portfolio-piyaidea/ |
| NORTHLINE | `webwai/demos/northline/` | https://Piyaidea.github.io/Ai-Demo-Portfolio-piyaidea/webwai/demos/northline/ |
| SOLIDFORM | `webwai/demos/solidform/` | https://Piyaidea.github.io/Ai-Demo-Portfolio-piyaidea/webwai/demos/solidform/ |

แต่ละ Demo มี HTML, CSS, JavaScript และรูปภาพของตัวเอง สามารถคัดลอกโฟลเดอร์ไปเปิดเป็นเว็บไซต์แยกได้ ดู README ภายใน Demo ก่อนย้ายลิงก์กลับ WEBWAI

เว็บไซต์หลักแก้ข้อความ ราคา และดีไซน์ใน `webwai/index.html` ซึ่งรวม CSS / JS ไว้ในไฟล์เดียว
LINE ยังไม่ถูกตั้งค่า: ระบุ URL จริงใน `WEBWAI_CONFIG.lineUrl` เมื่อยืนยันช่องทางติดต่อแล้ว

## วิธีเก็บและเผยแพร่
1. แก้ไฟล์ต้นฉบับใน branch `webwai-main` แล้ว Commit changes
2. GitHub Pages ใช้ branch `webwai-pages` จึงต้องอัปเดตไฟล์ที่เปลี่ยนบน branch นี้ด้วย ไม่ได้ sync จาก webwai-main อัตโนมัติ
3. NORTHLINE / SOLIDFORM ใช้ path เดียวกันทั้ง 2 branch ส่วน DAYNEST เผยแพร่ที่ root ของ webwai-pages
4. รอ workflow Pages สำเร็จ แล้วเปิด URL สาธารณะตรวจสอบ

Repo main เดิมยังเป็น portfolio ของเจ้าของ ไม่ใช้เป็นสาขาเผยแพร่ WEBWAI

ข้อมูลใน Demo เป็นข้อมูลสมมติ แบบฟอร์มตัวอย่างไม่มี backend
