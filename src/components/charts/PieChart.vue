<template>
  <div ref="chartRef" :style="{ height, width: '100%' }" />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 註冊組件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
])

interface PieDataItem {
  name: string
  value: number
  color?: string
}

const props = withDefaults(
  defineProps<{
    data: PieDataItem[]
    title?: string
    height?: string
    showLegend?: boolean
    isDonut?: boolean // 是否為環形圖
    radius?: string[] // 自訂半徑 ['50%', '70%']
  }>(),
  {
    title: '',
    height: '400px',
    showLegend: true,
    isDonut: false,
    radius: () => ['0%', '70%'],
  }
)

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.EChartsType | null = null

const chartOption = computed(() => {
  // 計算總數
  const total = props.data.reduce((sum, item) => sum + item.value, 0)

  return {
    title: props.title
      ? {
          text: props.title,
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold',
          },
        }
      : undefined,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
      },
      formatter: (params: any) => {
        const percentage = ((params.value / total) * 100).toFixed(1)
        return `
          <div style="padding: 8px 12px;">
            <div style="display: flex; align-items: center; margin-bottom: 4px;">
              <span style="
                display: inline-block;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background-color: ${params.color};
                margin-right: 8px;
              "></span>
              <span style="font-weight: 600; font-size: 14px;">${params.name}</span>
            </div>
            <div style="margin-left: 18px; font-size: 13px;">
              <div style="color: #6b7280;">數量: <span style="color: #111827; font-weight: 600;">${params.value}</span></div>
              <div style="color: #6b7280;">佔比: <span style="color: #111827; font-weight: 600;">${percentage}%</span></div>
            </div>
          </div>
        `
      },
    },
    legend: props.showLegend
      ? {
          orient: 'vertical',
          right: '5%',
          top: 'center',
          icon: 'circle',
          itemWidth: 10,
          itemHeight: 10,
          textStyle: {
            fontSize: 12,
          },
          formatter: (name: string) => {
            const item = props.data.find((d) => d.name === name)
            if (!item) return name
            const percentage = ((item.value / total) * 100).toFixed(1)
            return `${name} (${percentage}%)`
          },
        }
      : undefined,
    series: [
      {
        type: 'pie',
        radius: props.isDonut ? props.radius : props.radius[1],
        center: ['40%', '50%'],
        data: props.data.map((item) => ({
          name: item.name,
          value: item.value,
          itemStyle: item.color
            ? {
                color: item.color,
              }
            : undefined,
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: props.showLegend
          ? {
              show: false,
            }
          : {
              show: true,
              formatter: '{b}: {d}%',
            },
      },
    ],
  }
})

function initChart() {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(chartOption.value)
}

function resizeChart() {
  chartInstance?.resize()
}

watch(
  () => props.data,
  () => {
    if (chartInstance) {
      chartInstance.setOption(chartOption.value)
    }
  },
  { deep: true }
)

watch(chartOption, () => {
  if (chartInstance) {
    chartInstance.setOption(chartOption.value)
  }
})

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance?.dispose()
})
</script>
