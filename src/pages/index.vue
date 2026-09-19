<template>
    <v-container fluid class="fill-height align-start">
        <v-row>
            <v-col cols="12" md="8">
                <v-card class="pa-4 text-center" elevation="2" min-height="400">
                    <v-card-title class="text-h6 font-weight-bold px-0 text-left">
                        画像
                    </v-card-title>
                    <v-divider class="mb-4"></v-divider>
                    <div class="d-flex justify-center align-center fill-height mt-4"
                        style="background-color: lightgray;">
                        <svg ref="svgRef" :width="svgsize" :height="svgsize" :viewBox="viewBox">
                            <rect :x="svgsize / -2" :y="svgsize / -2" :width="svgsize" :height="svgsize" fill="white" />
                            <template v-for="p in circles">
                                <circle :cx="p.cx" :cy="p.cy" :r="p.r" stroke="black" :stroke-width="lwidth"
                                    fill="none" />
                            </template>
                            <template v-for="p in arcs">
                                <path :d="p" stroke="black" :stroke-width="lwidth" fill="none" />
                            </template>
                            <circle cx="0" cy="0" :r="rim_r" stroke="black" :stroke-width="lwidth" fill="none" />
                            <circle cx="0" cy="0" :r="rim_rr" stroke="black" :stroke-width="lwidth" fill="none" />
                        </svg>
                    </div>
                </v-card>
            </v-col>

            <v-col cols="12" md="4">
                <v-card class="pa-4" elevation="2">
                    <v-card-title class="text-h6 font-weight-bold px-0">
                        🎨 パラメーター
                    </v-card-title>
                    <v-divider class="mb-4"></v-divider>

                    <div class="text-caption mb-1">画像サイズ: {{ svgsize }}</div>
                    <v-slider v-model="svgsize" :min="100" :max="1000" step="10" thumb-label color="primary"
                        @update:modelValue="onclick" />
                    <div class="text-caption mb-1">サークル: {{ r }}</div>
                    <v-slider v-model="r" :min="10" :max="100" step="1" thumb-label color="primary"
                        @update:modelValue="onclick" />
                    <div class="text-caption mb-1">レイヤ : {{ layer.toFixed(0) }}</div>
                    <v-slider v-model="layer" :min="1" :max="10" step="1" thumb-label color="primary"
                        @update:modelValue="onclick" />
                    <div class="text-caption mb-1">線幅 : {{ lwidth.toFixed(0) }}</div>
                    <v-slider v-model="lwidth" :min="1" :max="10" step="1" thumb-label color="primary"
                        @update:modelValue="onclick" />
                    <div class="text-caption mb-1">傾き : {{ angle.toFixed(0) }}</div>
                    <v-slider v-model="angle" :min="0" :max="60" step="5" thumb-label color="primary"
                        @update:modelValue="onclick" />
                    <v-row style="font-size: medium;">
                        <v-col cols="6">
                            ダウンロード
                        </v-col>
                        <v-col cols="3">
                            <v-btn @click="downloadSvg" color="primary" block>SVG</v-btn>
                        </v-col>
                        <v-col cols="3">
                            <v-btn @click="downloadPng" color="primary" block>PNG</v-btn>
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>
<script lang="ts" setup>
import { type Point, type Circle, Arc } from '@/lib/consts';
import { useApplicationStore } from '@/stores/applicationStore';
import { computed, onMounted, ref } from 'vue';

const app = useApplicationStore();

const svgsize = ref(500);
const viewBox = computed(() => {
    return "-" + svgsize.value / 2 + " -" + svgsize.value / 2 +
        " " + svgsize.value + " " + svgsize.value;
});
const layer = ref(2);                                       // レイヤ数
const r = ref(58.0);                                        // 各円のR
const lwidth = ref(1);                                      // 線幅
const rim_r = computed(() => {                              // 外側の円
    return (layer.value + 1) * r.value + lwidth.value - 1
});
const rim_rr = computed(() => {                             // 外側の円
    return (layer.value + 1.3) * r.value + lwidth.value - 1
});
const angle = ref(30);                                      // 画像傾き
const theta = computed(() => angle.value * (Math.PI / 180));// Radian
const svgRef = ref<SVGGraphicsElement | null>(null)
const circles = ref<Circle[]>([]);                          // 各円の座標値
const arcs = ref<string[]>([]);                             // 各弧の座標値

onMounted(() => {
    const [acircles, aarcs] = draw();
    circles.value = acircles;
    arcs.value = aarcs;
});

const onclick = () => {
    const [acircles, aarcs] = draw();
    circles.value = acircles;
    arcs.value = aarcs;
}

const draw = (): [Circle[], string[]] => {
    let list: Circle[] = [];
    const v1 = [r.value, 0];
    const v2 = [r.value * Math.cos(Math.PI / 3), r.value * Math.sin(Math.PI / 3)];
    const c: number = Math.cos(theta.value);
    const s: number = Math.sin(theta.value);
    const center: Point = { x: 0, y: 0, angle: 0 }
    const arcs: string[] = [];
    const outer: Point[] = [];

    // 指定された層の範囲で格子点を生成
    for (var i = -layer.value - 1; i < layer.value + 1 + 1; i++) {
        for (var j = -layer.value - 1; j < layer.value + 1 + 1; j++) {
            // 中心からの距離（六角形基準の距離）をチェック iとjの符号が同じ場合は足し算、異なる場合は最大値が基準
            const layer_dist = (i * j >= 0) ? Math.abs(i + j) : Math.max(Math.abs(i), Math.abs(j));
            const pos = [
                i * v1[0] + j * v2[0],
                i * v1[1] + j * v2[1]
            ]
            const [posX, posY] = pos;
            const rotated_pos: [number, number] = [
                c * posX - s * posY,
                s * posX + c * posY
            ];
            if (layer_dist <= layer.value) {
                // 指定した層の内側
                list.push({ cx: rotated_pos[0], cy: rotated_pos[1], r: r.value });
            } else if (layer_dist <= layer.value + 1) {
                // 外縁の円弧(中心からの角度も計算しておく)
                const angle = Math.atan2(rotated_pos[0] - center.y, rotated_pos[1] - center.x);
                outer.push({ x: rotated_pos[0], y: rotated_pos[1], angle: angle });
            }
        }
    }
    // 外縁の円弧を中心からの角度順にソート
    const points_outer = outer.sort((a, b) => a.angle - b.angle);
    // 外側の弧を描画
    for (let i = 0; i < points_outer.length; i++) {
        const st = (i == 0) ? 1 : (i == points_outer.length - 1) ? 0 : i + 1;
        const en = (i == 0) ? points_outer.length - 1 : (i == points_outer.length - 1) ? points_outer.length - 2 : i - 1;
        arcs.push(new Arc(points_outer[en].x, points_outer[en].y, points_outer[st].x, points_outer[st].y, r.value).d());
        arcs.push(new Arc(points_outer[en].x, points_outer[en].y, points_outer[i].x, points_outer[i].y, r.value).d());
    }
    return [list, arcs];
}

const downloadSvg = () => {
    if (!svgRef.value)
        return
    // 1. SVGのDOMを文字列（XML）に変換
    const serializer = new XMLSerializer()
    let svgString = serializer.serializeToString(svgRef.value)
    // 2. 正しいXML名前空間（xmlns）が付与されているか確認（なければ追加）
    if (!svgString.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        svgString = svgString.replace(/^<svg/, '<svg xmlns="http://w3.org"');
    }
    // 3. Blob（バイナリデータ）を作成
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    // 4. 一時的なダウンロード用のリンクを作成してクリック
    const link = document.createElement('a')
    link.href = url
    link.download = `fol-${Date.now()}.svg` // ファイル名
    document.body.appendChild(link)
    link.click()
    // 5. 後片付け（メモリ解放と要素削除）
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

const downloadPng = () => {
    if (!svgRef.value)
        return
    // 1. SVGのDOMを文字列（XML）に変換
    const serializer = new XMLSerializer()
    let svgString = serializer.serializeToString(svgRef.value)
    // 名前の空間の修正（既存のコードの修正：正しいURLに変更）
    if (!svgString.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        svgString = svgString.replace(/^<svg/, '<svg xmlns="http://w3.org"');
    }
    // 2. SVGのサイズを取得（Canvasのサイズ合わせ用）
    const width = svgsize.value;
    const height = svgsize.value;
    // 3. BlobおよびURLを作成
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(blob)
    // 4. Imageオブジェクトを使ってCanvasに描画
    const img = new Image()
    img.onload = () => {
        // 仮想Canvasの作成
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
            // 背景を透明（または白）にしてSVGを描画
            ctx.drawImage(img, 0, 0, width, height)
            // 5. CanvasからPNGのData URLを生成
            const pngUrl = canvas.toDataURL('image/png')
            // 6. ダウンロード用のリンクを作成してクリック
            const link = document.createElement('a')
            link.href = pngUrl
            link.download = `sierpinski-carpet-${Date.now()}.png`
            document.body.appendChild(link)
            link.click()
            // 7. 後片付け
            document.body.removeChild(link)
        }
        URL.revokeObjectURL(svgUrl)
    }

    img.onerror = () => {
        console.error('画像の読み込みに失敗しました。')
        URL.revokeObjectURL(svgUrl)
    }

    // Imageの読み込みを開始
    img.src = svgUrl
}
</script>
