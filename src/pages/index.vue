<template>
    <v-navigation-drawer v-model="app.drawer" location="right">
        サイズ : {{ r.toFixed(0) }}
        <v-slider v-model="r" :min="10" :max="100" step="1" @update:modelValue="onclick" style="width: 200px;"></v-slider>
        レイヤ : {{ layer.toFixed(0) }}
        <v-slider v-model="layer" :min="1" :max="10" step="1" @update:modelValue="onclick" style="width: 200px;"></v-slider>
        傾き    : {{ angle.toFixed(0) }}
        <v-slider v-model="angle" :min="0" :max="60" step="5" @update:modelValue="onclick" style="width: 200px;"></v-slider>
    </v-navigation-drawer>
    <v-main style="border: 1px solid gray;">
        <div class="page">
            <div class="svg-container">
                <svg width="500" height="500" viewBox="-250 -250 500 500">
                    <rect x="-250" y="-250" width="500" height="500" fill="white" />
                    <template v-for="p in centers">
                        <circle :cx="p.cx" :cy="p.cy" :r="p.r" stroke="black" stroke-width="1" fill="none" />
                    </template>
                    <circle cx="0" cy="0" :r="outer_r" stroke="black" stroke-width="1" fill="none" />
                    <circle cx="0" cy="0" :r="outer_r + 10" stroke="black" stroke-width="1" fill="none" />
                </svg>
            </div>
        </div>
    </v-main>
</template>
<script lang="ts" setup>
import type { Circle } from '@/lib/consts';
import { useApplicationStore } from '@/stores/applicationStore';
import { computed, onMounted, ref } from 'vue';

const app = useApplicationStore();
const centers = ref<Circle[]>([]);
const layer = ref(3);
const r = ref(20.0);
const outer_r = computed(() => {
    return (layer.value + 1) * r.value
});
const angle = ref(30);
const theta = computed(() =>angle.value * (Math.PI / 180));

onMounted(() => {
    centers.value = draw();
});

const onclick = () => {
    centers.value = draw();
}
const draw = () => {
    let list: Circle[] = [];
    const v1 = [r.value, 0];
    const v2 = [r.value * Math.cos(Math.PI / 3), r.value * Math.sin(Math.PI / 3)];
    const c: number = Math.cos(theta.value);
    const s: number = Math.sin(theta.value);

    // 指定された層の範囲で格子点を生成
    for (var i = -layer.value; i < layer.value+1; i++) {
        for (var j = -layer.value; j < layer.value+1; j++) {
            // 中心からの層の距離（六角形基準の距離）をチェック
            // iとjの符号が同じ場合は足し算、異なる場合は最大値が基準
            const layer_dist = (i * j >= 0) ? Math.abs(i + j) : Math.max(Math.abs(i), Math.abs(j));
            // 指定した層の内側（第5層までなら layer_dist <= 5）の点を採用
            if (layer_dist <= layer.value) {
                const pos = [
                    i * v1[0] + j * v2[0],
                    i * v1[1] + j * v2[1]
                ]
                const [posX, posY] = pos;
                const rotated_pos: [number, number] = [
                    c * posX - s * posY,
                    s * posX + c * posY
                ];
                // 浮動小数点の誤差を丸めて保存
                //list.push({ cx: pos[0], cy: pos[1], r: r.value });
                list.push({ cx: rotated_pos[0], cy: rotated_pos[1], r: r.value });
            }
        }
    }
    return list;
}
</script>
