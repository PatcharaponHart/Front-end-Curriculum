<template>
    <span class="text-primary" style="font-size: 1.6em">บันทึกแผนการเรียน</span>
    <div class="card">
        <Fieldset legend="ปีที่ 1 ภาคการศึกษาที่ 1" :toggleable="true">
            <DataTable :value="yr1Sem1" tableStyle="min-width: 50rem">
                <Column field="code" header="รหัสวิชา" style="width: 15%" />
                <Column field="name" header="ชื่อวิชา" style="width: 30%" />
                <Column field="category" header="เกรดวิชา" style="width: 20%">
                    <template #body="slotProps">
                        <Select v-model="slotProps.data.category" :options="gradeOptions" placeholder="เลือกเกรด" style="width: 50%" appendTo="body" />
                    </template>
                </Column>

                <Column field="quantity" header="จำนวนหน่วยกิต" style="width: 35%" />
            </DataTable>
        </Fieldset>
    </div>

    <div class="card">
        <Fieldset legend="ปีที่ 1 ภาคการศึกษาที่ 2" :toggleable="true">
            <DataTable :value="yr1Sem2" tableStyle="min-width: 50rem">
                <Column field="code" header="รหัสวิชา" style="width: 15%" />
                <Column field="name" header="ชื่อวิชา" style="width: 30%" />
                <Column field="category" header="เกรดวิชา" style="width: 20%">
                    <template #body="slotProps">
                        <Select v-model="slotProps.data.category" :options="gradeOptions" placeholder="เลือกเกรด" style="width: 50%" appendTo="body" />
                    </template>
                </Column>

                <Column field="quantity" header="จำนวนหน่วยกิต" style="width: 35%" />
            </DataTable>
        </Fieldset>
    </div>

    <div class="card">
        <Fieldset legend="ปีที่ 2 ภาคการศึกษาที่ 1" :toggleable="true">
            <DataTable :value="yr2Sem1" tableStyle="min-width: 50rem">
                <Column field="code" header="รหัสวิชา" style="width: 15%" />
                <Column field="name" header="ชื่อวิชา" style="width: 30%" />
                <Column field="category" header="เกรดวิชา" style="width: 20%">
                    <template #body="slotProps">
                        <Select v-model="slotProps.data.category" :options="gradeOptions" placeholder="เลือกเกรด" style="width: 50%" appendTo="body" />
                    </template>
                </Column>

                <Column field="quantity" header="จำนวนหน่วยกิต" style="width: 35%" />
            </DataTable>
        </Fieldset>
    </div>

    <div class="card">
        <Fieldset legend="ปีที่ 2 ภาคการศึกษาที่ 2" :toggleable="true">
            <DataTable :value="yr2Sem2" tableStyle="min-width: 50rem">
                <Column field="code" header="รหัสวิชา" style="width: 15%" />
                <Column field="name" header="ชื่อวิชา" style="width: 30%" />
                <Column field="category" header="เกรดวิชา" style="width: 20%">
                    <template #body="slotProps">
                        <Select v-model="slotProps.data.category" :options="gradeOptions" placeholder="เลือกเกรด" style="width: 50%" appendTo="body" />
                    </template>
                </Column>

                <Column field="quantity" header="จำนวนหน่วยกิต" style="width: 35%" />
            </DataTable>
        </Fieldset>
    </div>

    <div class="card">
        <Fieldset legend="ปีที่ 3 ภาคการศึกษาที่ 1" :toggleable="true">
            <DataTable :value="yr3Sem1" tableStyle="min-width: 50rem">
                <Column field="code" header="รหัสวิชา" style="width: 15%" />
                <Column field="name" header="ชื่อวิชา" style="width: 30%" />
                <Column field="category" header="เกรดวิชา" style="width: 20%">
                    <template #body="slotProps">
                        <Select v-model="slotProps.data.category" :options="gradeOptions" placeholder="เลือกเกรด" style="width: 50%" appendTo="body" />
                    </template>
                </Column>

                <Column field="quantity" header="จำนวนหน่วยกิต" style="width: 35%" />
            </DataTable>
        </Fieldset>
    </div>

    <div class="card">
        <Fieldset legend="ปีที่ 3 ภาคการศึกษาที่ 2" :toggleable="true">
            <DataTable :value="yr3Sem2" tableStyle="min-width: 50rem">
                <Column field="code" header="รหัสวิชา" style="width: 15%" />
                <Column field="name" header="ชื่อวิชา" style="width: 30%" />
                <Column field="category" header="เกรดวิชา" style="width: 20%">
                    <template #body="slotProps">
                        <Select v-model="slotProps.data.category" :options="gradeOptions" placeholder="เลือกเกรด" style="width: 50%" appendTo="body" />
                    </template>
                </Column>

                <Column field="quantity" header="จำนวนหน่วยกิต" style="width: 35%" />
            </DataTable>
        </Fieldset>
    </div>

    <div class="card">
        <Fieldset legend="ปีที่ 4 ภาคการศึกษาที่ 1" :toggleable="true">
            <DataTable :value="yr4Sem1" tableStyle="min-width: 50rem">
                <Column field="code" header="รหัสวิชา" style="width: 15%" />
                <Column field="name" header="ชื่อวิชา" style="width: 30%" />
                <Column field="category" header="เกรดวิชา" style="width: 20%">
                    <template #body="slotProps">
                        <Select v-model="slotProps.data.category" :options="gradeOptions" placeholder="เลือกเกรด" style="width: 50%" appendTo="body" />
                    </template>
                </Column>

                <Column field="quantity" header="จำนวนหน่วยกิต" style="width: 35%" />
            </DataTable>
        </Fieldset>
    </div>

    <div class="card">
        <Fieldset legend="ปีที่ 4 ภาคการศึกษาที่ 2" :toggleable="true">
            <DataTable :value="yr4Sem2" tableStyle="min-width: 50rem">
                <Column field="code" header="รหัสวิชา" style="width: 15%" />
                <Column field="name" header="ชื่อวิชา" style="width: 30%" />
                <Column field="category" header="เกรดวิชา" style="width: 20%">
                    <template #body="slotProps">
                        <Select v-model="slotProps.data.category" :options="gradeOptions" placeholder="เลือกเกรด" style="width: 50%" appendTo="body" />
                    </template>
                </Column>

                <Column field="quantity" header="จำนวนหน่วยกิต" style="width: 35%" />
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
        code: '01417111', // รหัสวิชา
        name: 'แคลคูลัส I', // ชื่อวิชา
        category: null,
        quantity: 3 // จำนวนหน่วยกิต (ใส่ null หรือ 0 หรือค่าเริ่มต้นที่เหมาะสม, สมมติว่า 3 หน่วยกิต)
    },
    {
        code: '01418111',
        name: 'วิทยาการคอมพิวเตอร์เบื้องต้น',
        category: null,
        quantity: 2
    },
    {
        code: '01418112	',
        name: 'แนวคิดการโปรแกรมเบื้องต้น',
        category: null,
        quantity: 3
    },
    {
        code: '01418141',
        name: 'ทรัพย์สินทางปัญญาและจรรยาบรรณวิชาชีพ',
        category: null,
        quantity: 3
    },
    {
        code: '01999111',
        name: 'ศาสตร์แห่งแผ่นดิน',
        category: null,
        quantity: 2
    },
    {
        code: '',
        name: 'วิชาภาษาไทย',
        category: null,
        quantity: 3
    },
    {
        code: '',
        name: 'วิชาภาษาต่างประเทศ 1 ภาษา',
        category: null,
        quantity: 3
    }
]);

const yr1Sem2 = ref<any[]>([
    {
        code: '01417322', // รหัสวิชา
        name: 'พีชคณิตเชิงเส้นเบื้องต้น', // ชื่อวิชา
        category: null,
        quantity: 3 // จำนวนหน่วยกิต (ใส่ null หรือ 0 หรือค่าเริ่มต้นที่เหมาะสม, สมมติว่า 3 หน่วยกิต)
    },
    {
        code: '01418113',
        name: 'การโปรแกรมคอมพิวเตอร์',
        category: null,
        quantity: 3
    },
    {
        code: '01418131	',
        name: 'การโปรแกรมทางสถิติ',
        category: null,
        quantity: 3
    },
    {
        code: '01418132',
        name: 'หลักมูลการคณนา',
        category: null,
        quantity: 3
    },
    {
        code: '01175xxx',
        name: 'กิจกรรมพลศึกษา',
        category: null,
        quantity: 1
    },
    {
        code: '',
        name: 'วิชาศึกษาทั่วไปกลุ่มสาระศาสตร์แห่งผู้ประกอบการ',
        category: null,
        quantity: 3
    },
    {
        code: '',
        name: 'วิชาศึกษาทั่วไปกลุ่มสาระสุนทรียศาสตร์',
        category: null,
        quantity: 3
    }
]);

const yr2Sem1 = ref<any[]>([
    {
        code: '01418211', // รหัสวิชา
        name: 'การสร้างซอฟต์แวร์', // ชื่อวิชา
        category: null,
        quantity: 3 // จำนวนหน่วยกิต (ใส่ null หรือ 0 หรือค่าเริ่มต้นที่เหมาะสม, สมมติว่า 3 หน่วยกิต)
    },
    {
        code: '01418231',
        name: 'โครงสร้างข้อมูลและขั้นตอนวิธี',
        category: null,
        quantity: 3
    },
    {
        code: '01418233	',
        name: 'สถาปัตยกรรมคอมพิวเตอร์',
        category: null,
        quantity: 3
    },
    {
        code: '',
        name: 'วิชาเฉพาะเลือก',
        category: null,
        quantity: 3
    },
    {
        code: '',
        name: 'วิชาสารสนเทศ/คอมพิวเตอร์',
        category: null,
        quantity: 1
    },
    {
        code: '',
        name: 'วิชาศึกษาทั่วไปกลุ่มสาระอยู่ดีมีสุข',
        category: null,
        quantity: 2
    },
    {
        code: '',
        name: 'วิชาศึกษาทั่วไปใน 5 กลุ่มสาระ',
        category: null,
        quantity: 3
    }
]);

const yr2Sem2 = ref<any[]>([
    {
        code: '01418221', // รหัสวิชา
        name: 'ระบบฐานข้อมูลเบื้องต้น', // ชื่อวิชา
        category: null,
        quantity: 3 // จำนวนหน่วยกิต (ใส่ null หรือ 0 หรือค่าเริ่มต้นที่เหมาะสม, สมมติว่า 3 หน่วยกิต)
    },
    {
        code: '01418232',
        name: 'การออกแบบและวิเคราะห์ขั้นตอนวิธี',
        category: null,
        quantity: 3
    },
    {
        code: '01418236	',
        name: 'ระบบปฏิบัติการ',
        category: null,
        quantity: 3
    },
    {
        code: '01418261',
        name: 'หลักพื้นฐานของปัญญาประดิษฐ์',
        category: null,
        quantity: 3
    },
    {
        code: '',
        name: 'วิชาสารสนเทศ/คอมพิวเตอร์',
        category: null,
        quantity: 3
    },
    {
        code: '',
        name: 'วิชาเฉพาะเลือก',
        category: null,
        quantity: 3
    },
    {
        code: '',
        name: 'วิชาภาษาต่างประเทศ 1 ภาษา',
        category: null,
        quantity: 3
    }
]);

const yr3Sem1 = ref<any[]>([
    {
        code: '01418321', // รหัสวิชา
        name: 'การวิเคราะห์และการออกแบบระบบ', // ชื่อวิชา
        category: null,
        quantity: 3 // จำนวนหน่วยกิต (ใส่ null หรือ 0 หรือค่าเริ่มต้นที่เหมาะสม, สมมติว่า 3 หน่วยกิต)
    },
    {
        code: '01418331',
        name: 'ทฤษฎีการคำนวณ',
        category: null,
        quantity: 3
    },
    {
        code: '01418351	',
        name: 'หลักการเครือข่ายคอมพิวเตอร์และการประมวลผลบนคลาวด์',
        category: null,
        quantity: 3
    },
    {
        code: '01418390',
        name: 'การเตรียมความพร้อมสหกิจศึกษา',
        category: null,
        quantity: 1
    },
    {
        code: '',
        name: 'วิชาเฉพาะเลือก',
        category: null,
        quantity: 3
    },
    {
        code: '',
        name: 'วิชาภาษาต่างประเทศ 1 ภาษา',
        category: null,
        quantity: 3
    },
    {
        code: '',
        name: 'วิชาศึกษาทั่วไปกลุ่มสาระพลเมืองไทยและพลเมืองโลก',
        category: null,
        quantity: 1
    },
    {
        code: '',
        name: 'วิชาศึกษาทั่วไปใน 5 กลุ่มสาระ',
        category: null,
        quantity: 2
    }
]);

const yr3Sem2 = ref<any[]>([
    {
        code: '01418332', // รหัสวิชา
        name: 'ความมั่นคงในระบบสารสนเทศ', // ชื่อวิชา
        category: null,
        quantity: 3 // จำนวนหน่วยกิต (ใส่ null หรือ 0 หรือค่าเริ่มต้นที่เหมาะสม, สมมติว่า 3 หน่วยกิต)
    },
    {
        code: '01418371',
        name: 'การบริหารโครงการและสตาร์ทอัพดิจิทัล',
        category: null,
        quantity: 3
    },
    {
        code: '01418497	',
        name: 'สัมมนา',
        category: null,
        quantity: 1
    },
    {
        code: '01418390',
        name: 'วิชาเฉพาะเลือก',
        category: null,
        quantity: 6
    },
    {
        code: '',
        name: 'วิชาเลือกเสรี',
        category: null,
        quantity: 3
    }
]);

const yr4Sem1 = ref<any[]>([
    {
        code: '01418490', // รหัสวิชา
        name: 'สหกิจศึกษา', // ชื่อวิชา
        category: null,
        quantity: 6 // จำนวนหน่วยกิต (ใส่ null หรือ 0 หรือค่าเริ่มต้นที่เหมาะสม, สมมติว่า 3 หน่วยกิต)
    }
]);

const yr4Sem2 = ref<any[]>([
    {
        code: '01418499', // รหัสวิชา
        name: 'โครงงานวิทยาการคอมพิวเตอร์', // ชื่อวิชา
        category: null,
        quantity: 3
    },
    {
        code: '', // รหัสวิชา
        name: 'วิชาเฉพาะเลือก', // ชื่อวิชา
        category: null,
        quantity: 3
    },
    {
        code: '', // รหัสวิชา
        name: 'วิชาเลือกเสรี', // ชื่อวิชา
        category: null,
        quantity: 3
    }
]);

const gradeOptions = ref(['A', 'B+', 'B', 'C+', 'C', 'D+', 'D']); // รายการเกรดที่เป็นไปได้

// columns ยังคงเดิม
const columns = [
    { field: 'code', header: 'รหัสวิชา' },
    { field: 'name', header: 'ชื่อวิชา' },
    { field: 'category', header: 'เกรดวิชา' },
    { field: 'quantity', header: 'จำนวนหน่วยกิต' }
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
</style>
