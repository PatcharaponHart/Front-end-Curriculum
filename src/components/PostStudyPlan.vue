<template>
    <h2 class="text-primary">บันทึกแผนการเรียน</h2>
    <div class="card">
        <Fieldset legend="ปีที่ 1 ภาคการศึกษาที่ 1" :toggleable="true">
            <DataTable :value="yr1Sem1" tableStyle="min-width: 50rem">
                <Column field="courseCode" header="รหัสวิชา" style="width: 15%" />
                <Column field="courseNameTH" header="ชื่อวิชา" style="width: 30%" />
                <Column field="grade" header="เกรดวิชา" style="width: 20%">
                    <template #body="slotProps">
                        <Select v-model="slotProps.data.grade" :options="gradeOptions" placeholder="เลือกเกรด" style="width: 50%" appendTo="body" />
                    </template>
                </Column>

                <Column field="credit" header="จำนวนหน่วยกิต" style="width: 35%" />
            </DataTable>
        </Fieldset>
    </div>

    <div class="card">
        <Fieldset legend="ปีที่ 1 ภาคการศึกษาที่ 2" :toggleable="true">
            <DataTable :value="yr1Sem2" tableStyle="min-width: 50rem">
                <Column field="courseCode" header="รหัสวิชา" style="width: 15%" />
                <Column field="courseNameTH" header="ชื่อวิชา" style="width: 30%" />
                <Column field="grade" header="เกรดวิชา" style="width: 20%">
                    <template #body="slotProps">
                        <Select v-model="slotProps.data.grade" :options="gradeOptions" placeholder="เลือกเกรด" style="width: 50%" appendTo="body" />
                    </template>
                </Column>

                <Column field="credit" header="จำนวนหน่วยกิต" style="width: 35%" />
            </DataTable>
        </Fieldset>
    </div>

    <div class="card">
        <Fieldset legend="ปีที่ 2 ภาคการศึกษาที่ 1" :toggleable="true">
            <DataTable :value="yr2Sem1" tableStyle="min-width: 50rem">
                <Column field="courseCode" header="รหัสวิชา" style="width: 15%" />
                <Column field="courseNameTH" header="ชื่อวิชา" style="width: 30%" />
                <Column field="grade" header="เกรดวิชา" style="width: 20%">
                    <template #body="slotProps">
                        <Select v-model="slotProps.data.grade" :options="gradeOptions" placeholder="เลือกเกรด" style="width: 50%" appendTo="body" />
                    </template>
                </Column>

                <Column field="credit" header="จำนวนหน่วยกิต" style="width: 35%" />
            </DataTable>
        </Fieldset>
    </div>

    <div class="card">
        <Fieldset legend="ปีที่ 2 ภาคการศึกษาที่ 2" :toggleable="true">
            <DataTable :value="yr2Sem2" tableStyle="min-width: 50rem">
                <Column field="courseCode" header="รหัสวิชา" style="width: 15%" />
                <Column field="courseNameTH" header="ชื่อวิชา" style="width: 30%" />
                <Column field="grade" header="เกรดวิชา" style="width: 20%">
                    <template #body="slotProps">
                        <Select v-model="slotProps.data.grade" :options="gradeOptions" placeholder="เลือกเกรด" style="width: 50%" appendTo="body" />
                    </template>
                </Column>

                <Column field="credit" header="จำนวนหน่วยกิต" style="width: 35%" />
            </DataTable>
        </Fieldset>
    </div>

    <div class="card">
        <Fieldset legend="ปีที่ 3 ภาคการศึกษาที่ 1" :toggleable="true">
            <DataTable :value="yr3Sem1" tableStyle="min-width: 50rem">
                <Column field="courseCode" header="รหัสวิชา" style="width: 15%" />
                <Column field="courseNameTH" header="ชื่อวิชา" style="width: 30%" />
                <Column field="grade" header="เกรดวิชา" style="width: 20%">
                    <template #body="slotProps">
                        <Select v-model="slotProps.data.grade" :options="gradeOptions" placeholder="เลือกเกรด" style="width: 50%" appendTo="body" />
                    </template>
                </Column>

                <Column field="credit" header="จำนวนหน่วยกิต" style="width: 35%" />
            </DataTable>
        </Fieldset>
    </div>

    <div class="card">
        <Fieldset legend="ปีที่ 3 ภาคการศึกษาที่ 2" :toggleable="true">
            <DataTable :value="yr3Sem2" tableStyle="min-width: 50rem">
                <Column field="courseCode" header="รหัสวิชา" style="width: 15%" />
                <Column field="courseNameTH" header="ชื่อวิชา" style="width: 30%" />
                <Column field="grade" header="เกรดวิชา" style="width: 20%">
                    <template #body="slotProps">
                        <Select v-model="slotProps.data.grade" :options="gradeOptions" placeholder="เลือกเกรด" style="width: 50%" appendTo="body" />
                    </template>
                </Column>

                <Column field="credit" header="จำนวนหน่วยกิต" style="width: 35%" />
            </DataTable>
        </Fieldset>
    </div>

    <div class="card">
        <Fieldset legend="ปีที่ 4 ภาคการศึกษาที่ 1" :toggleable="true">
            <DataTable :value="yr4Sem1" tableStyle="min-width: 50rem">
                <Column field="courseCode" header="รหัสวิชา" style="width: 15%" />
                <Column field="courseNameTH" header="ชื่อวิชา" style="width: 30%" />
                <Column field="grade" header="เกรดวิชา" style="width: 20%">
                    <template #body="slotProps">
                        <Select v-model="slotProps.data.grade" :options="gradeOptions" placeholder="เลือกเกรด" style="width: 50%" appendTo="body" />
                    </template>
                </Column>

                <Column field="credit" header="จำนวนหน่วยกิต" style="width: 35%" />
            </DataTable>
        </Fieldset>
    </div>

    <div class="card">
        <Fieldset legend="ปีที่ 4 ภาคการศึกษาที่ 2" :toggleable="true">
            <DataTable :value="yr4Sem2" tableStyle="min-width: 50rem">
                <Column field="courseCode" header="รหัสวิชา" style="width: 15%" />
                <Column field="courseNameTH" header="ชื่อวิชา" style="width: 30%" />
                <Column field="grade" header="เกรดวิชา" style="width: 20%">
                    <template #body="slotProps">
                        <Select v-model="slotProps.data.grade" :options="gradeOptions" placeholder="เลือกเกรด" style="width: 50%" appendTo="body" />
                    </template>
                </Column>

                <Column field="credit" header="จำนวนหน่วยกิต" style="width: 35%" />
            </DataTable>
        </Fieldset>
    </div>
</template>

<script setup lang="ts">
import Select from 'primevue/select';
import { ref } from 'vue'; // ยังต้องใช้ ref

// กำหนดข้อมูลเริ่มต้นให้ products โดยตรง
const yr1Sem1 = ref<any[]>([
    {
        courseCode: '01417111', // รหัสวิชา
        courseNameTH: 'แคลคูลัส I', // ชื่อวิชา
        grade: null,
        credit: 3 // จำนวนหน่วยกิต (ใส่ null หรือ 0 หรือค่าเริ่มต้นที่เหมาะสม, สมมติว่า 3 หน่วยกิต)
    },
    {
        courseCode: '01418111',
        courseNameTH: 'วิทยาการคอมพิวเตอร์เบื้องต้น',
        grade: null,
        credit: 2
    },
    {
        courseCode: '01418112	',
        courseNameTH: 'แนวคิดการโปรแกรมเบื้องต้น',
        grade: null,
        credit: 3
    },
    {
        courseCode: '01418141',
        courseNameTH: 'ทรัพย์สินทางปัญญาและจรรยาบรรณวิชาชีพ',
        grade: null,
        credit: 3
    },
    {
        courseCode: '01999111',
        courseNameTH: 'ศาสตร์แห่งแผ่นดิน',
        grade: null,
        credit: 2
    },
    {
        courseCode: '',
        courseNameTH: 'วิชาภาษาไทย',
        grade: null,
        credit: 3
    },
    {
        courseCode: '',
        courseNameTH: 'วิชาภาษาต่างประเทศ 1 ภาษา',
        grade: null,
        credit: 3
    }
]);

const yr1Sem2 = ref<any[]>([
    {
        courseCode: '01417322', // รหัสวิชา
        courseNameTH: 'พีชคณิตเชิงเส้นเบื้องต้น', // ชื่อวิชา
        grade: null,
        credit: 3 // จำนวนหน่วยกิต (ใส่ null หรือ 0 หรือค่าเริ่มต้นที่เหมาะสม, สมมติว่า 3 หน่วยกิต)
    },
    {
        courseCode: '01418113',
        courseNameTH: 'การโปรแกรมคอมพิวเตอร์',
        grade: null,
        credit: 3
    },
    {
        courseCode: '01418131	',
        courseNameTH: 'การโปรแกรมทางสถิติ',
        grade: null,
        credit: 3
    },
    {
        courseCode: '01418132',
        courseNameTH: 'หลักมูลการคณนา',
        grade: null,
        credit: 3
    },
    {
        courseCode: '01175xxx',
        courseNameTH: 'กิจกรรมพลศึกษา',
        grade: null,
        credit: 1
    },
    {
        courseCode: '',
        courseNameTH: 'วิชาศึกษาทั่วไปกลุ่มสาระศาสตร์แห่งผู้ประกอบการ',
        grade: null,
        credit: 3
    },
    {
        courseCode: '',
        courseNameTH: 'วิชาศึกษาทั่วไปกลุ่มสาระสุนทรียศาสตร์',
        grade: null,
        credit: 3
    }
]);

const yr2Sem1 = ref<any[]>([
    {
        courseCode: '01418211', // รหัสวิชา
        courseNameTH: 'การสร้างซอฟต์แวร์', // ชื่อวิชา
        grade: null,
        credit: 3 // จำนวนหน่วยกิต (ใส่ null หรือ 0 หรือค่าเริ่มต้นที่เหมาะสม, สมมติว่า 3 หน่วยกิต)
    },
    {
        courseCode: '01418231',
        courseNameTH: 'โครงสร้างข้อมูลและขั้นตอนวิธี',
        grade: null,
        credit: 3
    },
    {
        courseCode: '01418233	',
        courseNameTH: 'สถาปัตยกรรมคอมพิวเตอร์',
        grade: null,
        credit: 3
    },
    {
        courseCode: '',
        courseNameTH: 'วิชาเฉพาะเลือก',
        grade: null,
        credit: 3
    },
    {
        courseCode: '',
        courseNameTH: 'วิชาสารสนเทศ/คอมพิวเตอร์',
        grade: null,
        credit: 1
    },
    {
        courseCode: '',
        courseNameTH: 'วิชาศึกษาทั่วไปกลุ่มสาระอยู่ดีมีสุข',
        grade: null,
        credit: 2
    },
    {
        courseCode: '',
        courseNameTH: 'วิชาศึกษาทั่วไปใน 5 กลุ่มสาระ',
        grade: null,
        credit: 3
    }
]);

const yr2Sem2 = ref<any[]>([
    {
        courseCode: '01418221', // รหัสวิชา
        courseNameTH: 'ระบบฐานข้อมูลเบื้องต้น', // ชื่อวิชา
        grade: null,
        credit: 3 // จำนวนหน่วยกิต (ใส่ null หรือ 0 หรือค่าเริ่มต้นที่เหมาะสม, สมมติว่า 3 หน่วยกิต)
    },
    {
        courseCode: '01418232',
        courseNameTH: 'การออกแบบและวิเคราะห์ขั้นตอนวิธี',
        grade: null,
        credit: 3
    },
    {
        courseCode: '01418236	',
        courseNameTH: 'ระบบปฏิบัติการ',
        grade: null,
        credit: 3
    },
    {
        courseCode: '01418261',
        courseNameTH: 'หลักพื้นฐานของปัญญาประดิษฐ์',
        grade: null,
        credit: 3
    },
    {
        courseCode: '',
        courseNameTH: 'วิชาสารสนเทศ/คอมพิวเตอร์',
        grade: null,
        credit: 3
    },
    {
        courseCode: '',
        courseNameTH: 'วิชาเฉพาะเลือก',
        grade: null,
        credit: 3
    },
    {
        courseCode: '',
        courseNameTH: 'วิชาภาษาต่างประเทศ 1 ภาษา',
        grade: null,
        credit: 3
    }
]);

const yr3Sem1 = ref<any[]>([
    {
        courseCode: '01418321', // รหัสวิชา
        courseNameTH: 'การวิเคราะห์และการออกแบบระบบ', // ชื่อวิชา
        grade: null,
        credit: 3 // จำนวนหน่วยกิต (ใส่ null หรือ 0 หรือค่าเริ่มต้นที่เหมาะสม, สมมติว่า 3 หน่วยกิต)
    },
    {
        courseCode: '01418331',
        courseNameTH: 'ทฤษฎีการคำนวณ',
        grade: null,
        credit: 3
    },
    {
        courseCode: '01418351	',
        courseNameTH: 'หลักการเครือข่ายคอมพิวเตอร์และการประมวลผลบนคลาวด์',
        grade: null,
        credit: 3
    },
    {
        courseCode: '01418390',
        courseNameTH: 'การเตรียมความพร้อมสหกิจศึกษา',
        grade: null,
        credit: 1
    },
    {
        courseCode: '',
        courseNameTH: 'วิชาเฉพาะเลือก',
        grade: null,
        credit: 3
    },
    {
        courseCode: '',
        courseNameTH: 'วิชาภาษาต่างประเทศ 1 ภาษา',
        grade: null,
        credit: 3
    },
    {
        courseCode: '',
        courseNameTH: 'วิชาศึกษาทั่วไปกลุ่มสาระพลเมืองไทยและพลเมืองโลก',
        grade: null,
        credit: 1
    },
    {
        courseCode: '',
        courseNameTH: 'วิชาศึกษาทั่วไปใน 5 กลุ่มสาระ',
        grade: null,
        credit: 2
    }
]);

const yr3Sem2 = ref<any[]>([
    {
        courseCode: '01418332', // รหัสวิชา
        courseNameTH: 'ความมั่นคงในระบบสารสนเทศ', // ชื่อวิชา
        grade: null,
        credit: 3 // จำนวนหน่วยกิต (ใส่ null หรือ 0 หรือค่าเริ่มต้นที่เหมาะสม, สมมติว่า 3 หน่วยกิต)
    },
    {
        courseCode: '01418371',
        courseNameTH: 'การบริหารโครงการและสตาร์ทอัพดิจิทัล',
        grade: null,
        credit: 3
    },
    {
        courseCode: '01418497	',
        courseNameTH: 'สัมมนา',
        grade: null,
        credit: 1
    },
    {
        courseCode: '01418390',
        courseNameTH: 'วิชาเฉพาะเลือก',
        grade: null,
        credit: 6
    },
    {
        courseCode: '',
        courseNameTH: 'วิชาเลือกเสรี',
        grade: null,
        credit: 3
    }
]);

const yr4Sem1 = ref<any[]>([
    {
        courseCode: '01418490', // รหัสวิชา
        courseNameTH: 'สหกิจศึกษา', // ชื่อวิชา
        grade: null,
        credit: 6 // จำนวนหน่วยกิต (ใส่ null หรือ 0 หรือค่าเริ่มต้นที่เหมาะสม, สมมติว่า 3 หน่วยกิต)
    }
]);

const yr4Sem2 = ref<any[]>([
    {
        courseCode: '01418499', // รหัสวิชา
        courseNameTH: 'โครงงานวิทยาการคอมพิวเตอร์', // ชื่อวิชา
        grade: null,
        credit: 3
    },
    {
        courseCode: '', // รหัสวิชา
        courseNameTH: 'วิชาเฉพาะเลือก', // ชื่อวิชา
        grade: null,
        credit: 3
    },
    {
        courseCode: '', // รหัสวิชา
        courseNameTH: 'วิชาเลือกเสรี', // ชื่อวิชา
        grade: null,
        credit: 3
    }
]);

const gradeOptions = ref(['A', 'B+', 'B', 'C+', 'C', 'D+', 'D']); // รายการเกรดที่เป็นไปได้

// columns ยังคงเดิม
const columns = [
    { field: 'courseCode', header: 'รหัสวิชา' },
    { field: 'courseNameTH', header: 'ชื่อวิชา' },
    { field: 'grade', header: 'เกรดวิชา' },
    { field: 'credit', header: 'จำนวนหน่วยกิต' }
];

// เอา onMounted ออก หรือ comment ไว้ก่อน
/*
onMounted(() => {
    ProductService.getProductsMini().then((data) => {
        products.value = data; // บรรทัดนี้จะเขียนทับข้อมูลที่เราใส่ไว้
    });
});
*/
</script>

<style scoped>
.card {
    padding: 1rem;
    font-size: 1.3rem;
}
.h2 {
    font-size: 1em;
    font-weight: bold;
    margin-bottom: 15px;
}
</style>
