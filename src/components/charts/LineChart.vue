<template>
  <div ref="chartRef" :style="{ height, width: '100%' }" />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 註冊必要的組件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
])

interface SeriesData {
  name: string
  data: number[]
  color?: string
  smooth?: boolean
  showArea?: boolean
  yAxisIndex?: number // 0 = 左軸, 1 = 右軸
}

interface ChartData {
  xAxisData: string[] // X 軸標籤
  series: SeriesData[] // 多個系列
}

const props = withDefaults(
  defineProps<{
    chartData: ChartData
    title?: string
    height?: string
    showLegend?: boolean
    dualYAxis?: boolean // 是否啟用雙 Y 軸
    leftYAxisName?: string
    rightYAxisName?: string
  }>(),
  {
    title: '',
    height: '400px',
    showLegend: true,
    dualYAxis: false,
    leftYAxisName: '',
    rightYAxisName: '',
  }
)

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.EChartsType | null = null

const chartOption = computed(() => {
  const yAxisConfig: any[] = [
    {
      type: 'value',
      name: props.leftYAxisName,
      position: 'left',
      nameTextStyle: {
        fontSize: 13,
        color: '#6b7280',
        padding: [0, 0, 10, 0],
      },
      // 隱藏軸線
      axisLine: {
        show: false,
      },
      // 隱藏刻度
      axisTick: {
        show: false,
      },
      // 分隔線樣式
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
          type: 'dashed',
        },
      },
      // 自定義標籤 - 圓圈樣式
      axisLabel: {
        formatter: (value: number) => {
          // 格式化數值
          let displayValue = ''
          if (value >= 1000000) {
            displayValue = `${(value / 1000000).toFixed(0)}M`
          } else if (value >= 1000) {
            displayValue = `${(value / 1000).toFixed(0)}K`
          } else if (value === 0) {
            return '' // 不顯示 0
          } else {
            displayValue = value.toString()
          }
          
          // 使用 rich text 創建圓圈效果
          return `{circle|${displayValue}}`
        },
        // Rich text 樣式定義
        rich: {
          circle: {
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: '#fff',
            borderColor: '#667eea',
            borderWidth: 2,
            color: '#667eea',
            fontSize: 14,
            fontWeight: 'bold',
            align: 'center',
            verticalAlign: 'middle',
            lineHeight: 50,
          },
        },
        margin: 15,
      },
    },
  ]

  // 如果啟用雙 Y 軸，添加右側 Y 軸
  if (props.dualYAxis) {
    yAxisConfig.push({
      type: 'value',
      name: props.rightYAxisName,
      position: 'right',
      nameTextStyle: {
        fontSize: 13,
        color: '#6b7280',
        padding: [0, 0, 10, 0],
      },
      // 隱藏軸線
      axisLine: {
        show: false,
      },
      // 隱藏刻度
      axisTick: {
        show: false,
      },
      // 分隔線樣式（右軸不顯示，避免重複）
      splitLine: {
        show: false,
      },
      // 自定義標籤 - 圓圈樣式（不同顏色）
      axisLabel: {
        formatter: (value: number) => {
          if (value === 0) return ''
          
          let displayValue = ''
          if (value >= 1000000) {
            displayValue = `${(value / 1000000).toFixed(0)}M`
          } else if (value >= 1000) {
            displayValue = `${(value / 1000).toFixed(0)}K`
          } else {
            displayValue = value.toString()
          }
          
          return `{circle|${displayValue}}`
        },
        rich: {
          circle: {
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: '#fff',
            borderColor: '#409EFF',
            borderWidth: 2,
            color: '#409EFF',
            fontSize: 14,
            fontWeight: 'bold',
            align: 'center',
            verticalAlign: 'middle',
            lineHeight: 50,
          },
        },
        margin: 15,
      },
    })
  }

  const seriesConfig = props.chartData.series.map((serie) => {
    const config: any = {
      name: serie.name,
      type: 'line',
      smooth: serie.smooth !== undefined ? serie.smooth : true,
      data: serie.data,
      yAxisIndex: serie.yAxisIndex || 0,
      itemStyle: {
        color: serie.color || undefined,
      },
      lineStyle: {
        width: 2,
        color: serie.color || undefined,
      },
      emphasis: {
        focus: 'series',
      },
    }

    // 如果啟用區域填充
    if (serie.showArea) {
      config.areaStyle = {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: serie.color || '#409EFF',
          },
          {
            offset: 1,
            color: (serie.color || '#409EFF')
              .replace(')', ', 0.1)')
              .replace('rgb', 'rgba'),
          },
        ]),
      }
    }

    return config
  })

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
      backgroundColor: 'transparent',
      borderWidth: 0,
      padding: 0,
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#8b5cf6',
          width: 2,
          type: 'dashed',
        },
      },
      // 自定義 tooltip 顯示內容 - 高度自定義版本
      formatter: (params: any) => {
        if (!Array.isArray(params)) params = [params]
        
        const date = params[0].axisValue
        
        // 構建 HTML 結構
        let html = `
          <div style="
            position: relative;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 16px 20px 12px 20px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            min-width: 200px;
            color: white;
          ">
            <!-- 頂部圖標區域 -->
            <div style="
              position: absolute;
              top: -25px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 32px;
            ">
              🦆
            </div>
            
            <!-- 日期 -->
            <div style="
              font-size: 14px;
              font-weight: 600;
              margin-top: 8px;
              margin-bottom: 8px;
              opacity: 0.95;
            ">
              ${date}
            </div>
        `
        
        // 添加每個系列的數據
        params.forEach((param: any, index: number) => {
          const seriesName = param.seriesName
          const value = param.value
          const color = param.color
          
          // 根據系列名稱格式化數值
          let formattedValue = value
          let unit = ''
          
          if (seriesName.includes('金額') || seriesName.includes('銷售')) {
            // 格式化為貨幣，簡化大數字
            if (value >= 1000000) {
              formattedValue = (value / 1000000).toFixed(1)
              unit = 'M'
            } else if (value >= 1000) {
              formattedValue = (value / 1000).toFixed(1)
              unit = 'K'
            } else {
              formattedValue = value
            }
          } else if (seriesName.includes('數量')) {
            formattedValue = value
          } else {
            if (value >= 1000000) {
              formattedValue = (value / 1000000).toFixed(1)
              unit = 'M'
            } else if (value >= 1000) {
              formattedValue = (value / 1000).toFixed(1)
              unit = 'K'
            } else {
              formattedValue = value
            }
          }
          
          // 判斷數據狀態（可根據實際業務邏輯調整）
          let statusBadge = ''
          if (index === 0) { // 只在第一個系列顯示狀態標籤
            const status = value > 1000 ? '發展正常' : '需要關注'
            const statusColor = value > 1000 ? '#10b981' : '#f59e0b'
            
            statusBadge = `
              <span style="
                display: inline-block;
                background-color: ${statusColor};
                color: white;
                font-size: 11px;
                font-weight: 600;
                padding: 3px 10px;
                border-radius: 12px;
                margin-left: 8px;
              ">
                ${status}
              </span>
            `
          }
          
          html += `
            <div style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-top: ${index > 0 ? '8px' : '4px'};
            ">
              <div style="display: flex; align-items: center;">
                <span style="
                  display: inline-block;
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  background-color: ${color};
                  margin-right: 8px;
                "></span>
                <span style="font-size: 12px; opacity: 0.9;">${seriesName}</span>
              </div>
              <div style="display: flex; align-items: baseline;">
                <span style="
                  font-size: 24px;
                  font-weight: 700;
                  margin-left: 12px;
                ">${formattedValue}</span>
                ${unit ? `<span style="font-size: 16px; font-weight: 600; margin-left: 2px;">${unit}</span>` : ''}
                ${statusBadge}
              </div>
            </div>
          `
        })
        
        // 關閉容器
        html += `
          </div>
          <!-- 箭頭 -->
          <div style="
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 8px solid #764ba2;
          "></div>
        `
        
        return html
      },
    },
    legend: props.showLegend
      ? {
          data: props.chartData.series.map((s) => s.name),
          top: props.title ? '10%' : '5%',
        }
      : undefined,
    grid: {
      left: '3%',
      right: props.dualYAxis ? '8%' : '4%',
      bottom: '3%',
      top: props.showLegend ? '20%' : props.title ? '15%' : '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.chartData.xAxisData,
      axisLabel: {
        rotate: 45,
        fontSize: 12,
      },
    },
    yAxis: yAxisConfig,
    series: seriesConfig,
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

// 監聽數據變化
watch(
  () => props.chartData,
  () => {
    if (chartInstance) {
      chartInstance.setOption(chartOption.value)
    }
  },
  { deep: true }
)

// 監聽其他配置變化
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
