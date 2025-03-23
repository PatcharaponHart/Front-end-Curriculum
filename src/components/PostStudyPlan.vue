<template>
    <span>ลงแผนการเรียน</span>
    <div class="card">
        <DataTable :value="products" tableStyle="min-width: 50rem">
            <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" />
        </DataTable>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ProductService } from '@/service/ProductService';

// สร้าง products แบบ array
const products = ref<any[]>([]);

// สร้าง columns พร้อม type
const columns = [
    { field: 'code', header: 'Code' },
    { field: 'name', header: 'Name' },
    { field: 'category', header: 'Category' },
    { field: 'quantity', header: 'Quantity' }
];

// โหลดข้อมูลเมื่อ component mount
onMounted(() => {
    ProductService.getProductsMini().then((data) => {
        products.value = data;
    });
});
</script>
