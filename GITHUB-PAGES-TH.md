# WEBWAI / DAYNEST — นำขึ้น GitHub Pages

โปรเจกต์นี้เป็นเว็บไซต์ HTML/CSS/JavaScript 5 หน้า ไม่ต้องติดตั้งโปรแกรมหรือ build

1. สร้าง repository (ที่เก็บโค้ด) ใหม่ชื่อ `webwai-daynest-demo` เลือก Public เพื่อใช้ GitHub Pages บนบัญชีฟรี
2. แตก ZIP แล้วเข้าโฟลเดอร์ `daynest-demo` อัปโหลดไฟล์และโฟลเดอร์ข้างในทั้งหมดผ่าน Add file → Upload files ให้ `index.html` อยู่ระดับแรกของ repository ไม่ใช่อยู่ในโฟลเดอร์ daynest-demo อีกชั้น
3. กด Commit changes (บันทึกการเปลี่ยนแปลง)
4. ไป Settings (การตั้งค่า) → Pages
5. Source เลือก Deploy from a branch (เผยแพร่จากสาขาโค้ด)
6. Branch เลือก `main` และ `/(root)` แล้ว Save
7. เมื่อ GitHub แสดง Your site is live กด Visit site โดย URL จะมีรูปแบบ `https://ชื่อผู้ใช้.github.io/webwai-daynest-demo/`
8. ทดลองทั้ง 5 หน้า เมนูมือถือ และตัวกรองหน้า Menu

หากอัปโหลดผ่านเว็บแล้วมองไม่เห็น `.nojekyll` เว็บไซต์นี้ยังใช้ Jekyll ได้เพราะเป็น HTML ปกติ หรือสร้างไฟล์ `.nojekyll` ว่างผ่าน Add file → Create new file

## ปรับข้อมูล
- ข้อมูลติดต่อ: `data/site.js`
- เนื้อหาและชื่อร้านในแต่ละหน้า: ไฟล์ `.html`
- สีและฟอนต์: `assets/css/style.css` (ใช้ Noto Sans Thai)
- การทำงาน: `assets/js/main.js`

ชื่อ DAYNEST ในเนื้อหาและส่วนท้ายยังอยู่ใน HTML ต้องแก้แต่ละหน้าด้วย ไม่ใช่เฉพาะ site.js
ภาพ Unsplash เก็บอยู่ใน assets/images แล้ว ส่วน Google Fonts ยังต้องใช้อินเทอร์เน็ต ข้อมูลร้าน รีวิว และราคาเป็นตัวอย่าง กรุณาเปลี่ยนก่อนใช้กับธุรกิจจริง

เอกสารอ้างอิง: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Image fix
ภาพทั้งหมดเก็บใน assets/images และอ้างอิงด้วย relative paths รองรับ GitHub Pages ทั้งที่ root และใต้ชื่อ repository
