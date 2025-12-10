<template>
  <div ref="chartRef" :style="{ height, width: '100%' }" />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 註冊組件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  CanvasRenderer,
])

interface BarDataItem {
  name: string
  value: number
  color?: string
}

const props = withDefaults(
  defineProps<{
    data: BarDataItem[]
    title?: string
    height?: string
    horizontal?: boolean // 是否為水平柱狀圖
    showValues?: boolean // 是否顯示數值標籤
    color?: string // 統一顏色
  }>(),
  {
    title: '',
    height: '400px',
    horizontal: false,
    showValues: true,
    color: '#667eea',
  }
)

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.EChartsType | null = null

const chartOption = computed(() => {
  const names = props.data.map((d) => d.name)


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
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
      },
      formatter: (params: any) => {
        const param = Array.isArray(params) ? params[0] : params
        return `
          <div style="padding: 8px 12px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
              ${param.name}
            </div>
            <div style="color: #6b7280; font-size: 13px;">
              數量: <span style="color: #111827; font-weight: 600;">${param.value}</span>
            </div>
          </div>
        `
      },
    },
    grid: {
      left: props.horizontal ? '15%' : '3%',
      right: '4%',
      bottom: props.horizontal ? '3%' : '10%',
      top: props.title ? '15%' : '3%',
      containLabel: true,
    },
    xAxis: props.horizontal
      ? {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: {
            lineStyle: {
              color: '#f3f4f6',
              type: 'dashed',
            },
          },
        }
      : {
          type: 'category',
          data: names,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            rotate: 45,
            fontSize: 12,
          },
        },
    yAxis: props.horizontal
      ? {
          type: 'category',
          data: names,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            fontSize: 12,
          },
        }
      : {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: {
            lineStyle: {
              color: '#f3f4f6',
              type: 'dashed',
            },
          },
        },
    series: [
      {
        type: 'bar',
        data: props.data.map((item) => ({
          value: item.value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(
              0,
              props.horizontal ? 1 : 0,
              props.horizontal ? 1 : 0,
              props.horizontal ? 0 : 1,
              [
                { offset: 0, color: item.color || props.color },
                {
                  offset: 1,
                  color:
                    (item.color || props.color)
                      .replace(')', ', 0.6)')
                      .replace('rgb', 'rgba') || 'rgba(102, 126, 234, 0.6)',
                },
              ]
            ),
            borderRadius: props.horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
          },
        })),
        barWidth: props.horizontal ? '60%' : '40%',
        label: props.showValues
          ? {
              show: true,
              position: props.horizontal ? 'right' : 'top',
              formatter: '{c}',
              fontSize: 11,
              color: '#6b7280',
            }
          : undefined,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
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
