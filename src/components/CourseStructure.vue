<template>
    <span class="page-title">โครงสร้างหลักสูตร</span>

    <div class="card narrow-card">
        <p><strong class="me-2">1. หมวดวิชาศึกษาทั่วไป</strong> <span>ไม่น้อยกว่า 30 หน่วยกิต</span></p>

        <ul class="custom-list">
            <li>
                <span style="margin-right: 475px">กลุ่มสาระอยู่ดีมีสุข</span>
                <span>ไม่น้อยกว่า 3 หน่วยกิต</span>
            </li>
            <li>
                <span style="margin-right: 360px">กลุ่มสาระศาสตร์แห่งผู้ประกอบการ</span>
                <span>ไม่น้อยกว่า 3 หน่วยกิต</span>
            </li>
            <li>
                <span style="margin-right: 400px">กลุ่มสาระภาษากับการสื่อสาร</span>
                <span> ไม่น้อยกว่า 13 หน่วยกิต</span>
            </li>
            <li>
                <span style="margin-right: 325px">กลุ่มสาระพลเมืองไทยและพลเมืองโลก</span>
                <span>ไม่น้อยกว่า 3 หน่วยกิต</span>
            </li>
            <li>
                <span style="margin-right: 438px">กลุ่มสาระสุนทรียศาสตร์</span>
                <span>ไม่น้อยกว่า 3 หน่วยกิต</span>
            </li>
            <li>
                <span class="long-text" style="margin-right: 95px">
                    เลือกเรียนรายวิชาใน 5 กลุ่มสาระของหมวดวิชาศึกษาทั่วไปเฉพาะที่เป็น
                    <br />รายวิชาของคณะต้นสังกัดของหลักสูตรในแต่ละวิทยาเขตอีกไม่น้อยกว่า <br />5 หน่วยกิต ยกเว้นกลุ่มสาระภาษาและการสื่อสาร
                </span>
                <span>ไม่น้อยกว่า 5 หน่วยกิต</span>
            </li>
        </ul>

        <p><strong class="me-2">2. หมวดวิชาเฉพาะ</strong> <span>ไม่น้อยกว่า 88 หน่วยกิต</span></p>

        <ul class="custom-list">
            <li>
                <span style="margin-right: 550px">วิชาแกน</span>
                <span>12 หน่วยกิต</span>
            </li>
            <li>
                <span style="margin-right: 492px">วิชาเฉพาะบังคับ </span>
                <span>58 หน่วยกิต</span>
            </li>
            <li>
                <span style="margin-right: 525px">เฉพาะเลือก</span>
                <span> ไม่น้อยกว่า 18 หน่วยกิต</span>
            </li>
        </ul>

        <p><strong class="me-2">3.หมวดวิชาเลือกเสรี </strong> <span>ไม่น้อยกว่า 6 หน่วยกิต</span></p>
    </div>

    <span class="page-title">รายวิชา</span>

    <div class="card narrow-card">
        <p><strong class="me-2">1.หมวดวิชาศึกษาทั่วไป</strong> <span>ไม่น้อยกว่า 30 หน่วยกิต</span></p>

        <ul class="custom-list">
            <li>
                <span style="margin-right: 475px">กลุ่มสาระอยู่ดีมีสุข</span>
                <span>ไม่น้อยกว่า 3 หน่วยกิต</span>
            </li>

            <li class="arrow-item">
                <span style="margin-right: 130px">01175xxx กิจกรรมพลศึกษา (Physical Education Activities)</span>
                <span>1(0-2-1) หน่วยกิต</span>
            </li>
            <p><span>และเลือกเรียนอีกไม่น้อยกว่า 2 หน่วยกิต จากรายวิชาในหมวดวิชาศึกษาทั่วไป กลุ่มสาระอยู่ดีมีสุข</span></p>
        </ul>
    </div>
</template>

<style scoped>
.custom-list {
    list-style-type: none;
    padding-left: 0;
}

.custom-list li {
    /* เราไม่ใช้ flex แล้ว เพราะจะควบคุม margin เอง */
    /* display: flex; */
    padding-left: 2em; /* Padding สำหรับ Bullet */
    padding-top: 0.5em;
    padding-bottom: 0.5em;
    position: relative; /* สำหรับจัดตำแหน่ง bullet */
}

/* ใส่ Bullet Point */
.custom-list li::before {
    content: '•';
    position: absolute;
    left: 1em;
    top: 0.5em; /* ปรับ top ให้ตรงกับบรรทัดแรก */
    line-height: 1; /* ป้องกัน bullet เลื่อนถ้าข้อความหลักสูง */
}

/* ทำให้ span แรกเป็น inline-block เพื่อให้ margin-right ทำงานได้ถูกต้อง */
/* และให้ข้อความยาว wrap ได้ */
.custom-list li span:first-child {
    display: inline-block;
    vertical-align: top; /* จัดให้อยู่บนสุดเมื่อเทียบกับ span ที่สอง */
}

/* ทำให้ span ที่สอง (หน่วยกิต) เป็น inline-block เช่นกัน */
.custom-list li span:nth-child(2) {
    display: inline-block;
    vertical-align: top;
    white-space: nowrap; /* ป้องกันการขึ้นบรรทัดใหม่ */
}

.page-title {
    font-size: 1.5rem; /* <<< ปรับขนาดตัวอักษรที่นี่ */
    /* ค่าอื่นๆ ที่อาจจะต้องการเพิ่ม */
    font-weight: bold; /* ทำให้เป็นตัวหนา */
    display: block; /* ทำให้เป็น block เพื่อให้ margin ทำงานได้ */
    margin-bottom: 1rem; /* เพิ่มระยะห่างด้านล่าง */
    color: #333; /* เปลี่ยนสี (ถ้าต้องการ) */
}

.narrow-card {
    max-width: auto; /* กำหนดความกว้างสูงสุดที่ต้องการ (ปรับค่านี้ได้) */
    /* หรือใช้ width: 80%; ถ้าต้องการเป็น % */
    /* หรือใช้ width: 60rem; ถ้าต้องการหน่วย rem */

    margin-left: auto; /* ทำให้ card อยู่ตรงกลางแนวนอน */
    margin-right: auto; /* ทำให้ card อยู่ตรงกลางแนวนอน */
    font-size: 1.3rem;
}

.custom-list li.arrow-item {
    padding-left: 3.5em; /* <<< ปรับค่านี้เพื่อกำหนดระยะเยื้องที่ต้องการ */
    /* ค่านี้ควรมากกว่า padding-left พื้นฐาน (2em) */
}

.custom-list li.arrow-item::before {
    content: '→'; /* เปลี่ยนเป็นลูกศร */
    /* อาจจะต้องปรับตำแหน่งเล็กน้อยเพื่อให้ลูกศรดูสวยงาม */
    left: 2em; /* ลองปรับค่า left */
    top: 0.45em; /* ลองปรับค่า top */
    font-weight: bold; /* ทำให้ลูกศรหนาขึ้น (ถ้าต้องการ) */
    color: #555; /* เปลี่ยนสีลูกศร (ถ้าต้องการ) */
}
</style>
