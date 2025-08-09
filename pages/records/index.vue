<template>
  <view class="container">

    <!-- 月份选择，样式与首页一致 -->
    <view class="month-bar-row" @click="openMonthPicker">
      <picker mode="date" fields="month" :value="selectedMonth" @change="onMonthChange">
        <view class="month-picker">{{ selectedMonth }}</view>
      </picker>
    </view>

    <!-- 饼图卡片 -->
    <view class="chart-card shift-pie-card">
      <view class="card-title">本月{{ TIMESLOTS.day.name }}/{{ TIMESLOTS.night.name }}占比</view>
      <template v-if="shiftPie && shiftPie.totalKwh > 0">
        <view class="shift-pie-flex compact">
          <view class="shift-pie-chart-wrapper small">
            <qiun-data-charts
              type="pie"
              :opts="pieOpts"
              :chartData="pieData"
              canvasId="shiftPie"
              :canvas2d="true"
              :ontouch="true"
              :canvasStyle="pieCanvasStyle"
            />
          </view>
          <view class="shift-pie-legend right-legend">
            <view class="legend-item"
              ><span class="legend-dot day"></span> {{ TIMESLOTS.day.name }}
              {{ shiftPie ? shiftPie.dayKwh || 0 : 0 }} kWh</view
            >
            <view class="legend-item"
              ><span class="legend-dot night"></span> {{ TIMESLOTS.night.name }}
              {{ shiftPie ? shiftPie.nightKwh || 0 : 0 }} kWh</view
            >
          </view>
        </view>
      </template>
      <template v-else>
        <view class="chart-empty">
          <text>本月暂无班次数据</text>
        </view>
      </template>
    </view>

    <!-- 柱状图卡片 -->
    <view class="chart-card">
      <view class="card-title">每日充电量</view>
      <view
        v-if="dailyKwh.length > 0"
        class="chart-bar-group"
        ref="barGroup"
        style="position: relative"
      >
        <!-- tooltip -->
        <view v-if="tooltip.show" class="chart-tooltip" :style="{ left: tooltip.left + 'px' }">
          <text>{{ tooltip.date }}</text>
          <text>{{ tooltip.kwh }} kWh</text>
        </view>
        <view
          v-for="(item, index) in dailyKwh"
          :key="item.date"
          class="chart-bar-item"
          :style="{
            width: chartBarWidth + 'px',
            marginRight: index < dailyKwh.length - 1 ? chartBarGap + 'px' : '0',
          }"
          @touchstart="showTooltip($event, item, index)"
          @touchend="hideTooltip"
          @mouseleave="hideTooltip"
        >
          <view
            class="chart-bar"
            :style="{ width: chartBarWidth + 'px', height: getBarHeight(item.totalKwh) }"
          ></view>
          <text v-if="shouldShowLabel(index, dailyKwh.length)" class="chart-bar-label">{{
            item.date.slice(5, 10)
          }}</text>
        </view>
      </view>
      <view v-else class="chart-empty">暂无数据</view>
    </view>

    <!-- 列表卡片 -->
    <view class="chart-card record-list-card">
      <view class="card-title">充电明细</view>
      <view class="records-list">
        <view v-for="day in groupedRecords" :key="day.date" class="record-day-card one-line-row">
          <view class="record-day-header one-line-header">
            <SvgIcon name="calendar" size="24" color="#FFA500" />
            <text class="record-day-date">{{ formatDay(day.date) }}</text>
            <view class="record-shifts">
              <view class="shift-item day">
                <text class="shift-value">{{ day.dayKwh || 0 }} kWh</text>
              </view>
              <view class="shift-item night">
                <text class="shift-value">{{ day.nightKwh || 0 }} kWh</text>
              </view>
              <view class="shift-item total">
                <text class="shift-value">{{ day.totalKwh || 0 }} kWh</text>
              </view>
            </view>
          </view>
        </view>
        <view v-if="groupedRecords.length === 0" class="empty-state">
          <text>本月暂无充电记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>

  import SvgIcon from '@/components/SvgIcon.vue';
  import { getDailyStatistics } from '@/api/statistics';
  import { getMonthlyShiftStatistics } from '@/api/statistics';
  import { /* formatDate, */ getPayload } from '@/utils'; // formatDate 未使用
  import { getCurrentDate } from '@/utils';
  import qiunDataCharts from '@/uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue';
  import { TIMESLOTS } from '@/config';

  export default {
    components: { SvgIcon, qiunDataCharts },
    data() {
      return {
        TIMESLOTS, // 显式挂载，保证模板和js都能访问
        selectedMonth: getCurrentDate('YYYY-MM'),
        showMonthPicker: false,
        dailyKwh: [], // [{date, totalKwh, records: [...] }]
        chartBarWidth: 30, // px
        chartBarGap: 4, // px
        chartWidthPx: 300, // px，默认
        tooltip: {
          show: false,
          left: 0,
          date: '',
          kwh: 0,
        },
        shiftPie: null, // { dayKwh, nightKwh, totalKwh }
        pieData: {},
        pieOpts: {
          color: ['#FFA500', '#409EFF'],
          legend: { show: false },
          extra: {
            pie: {
              labelWidth: 30,
              border: false,
              activeOpacity: 0.5,
              activeRadius: 10,
              customRadius: 45,
            },
          }, // customRadius≈90rpx，留更多空白
        },
        pieCanvasStyle: 'width: 140rpx; height: 140rpx;',
      };
    },
    onLoad(options) {
      // 支持首页跳转带月份参数
      if (options && options.month) {
        this.selectedMonth = options.month;
      }
    },
    computed: {
      groupedRecords() {
        // 只返回有数据的天，并按日期倒序排列
        return this.dailyKwh
          .filter((day) => day.totalKwh > 0)
          .sort((a, b) => new Date(b.date) - new Date(a.date));
      },
      dayAngle() {
        if (!this.shiftPie || !this.shiftPie.totalKwh) return 0;
        return (this.shiftPie.dayKwh / this.shiftPie.totalKwh) * 360;
      },
    },
    watch: {
      selectedMonth() {
        this.loadDailyStatistics();
        this.loadMonthlyShift();
      },
      dailyKwh() {
        this.calcBarWidthGap();
      },
      shiftPie: {
        handler(val) {
          if (val && val.totalKwh > 0) {
            this.pieData = {
              series: [
                { name: this.TIMESLOTS.day.name, data: val.dayKwh || 0 },
                { name: this.TIMESLOTS.night.name, data: val.nightKwh || 0 },
              ],
            };
          } else {
            this.pieData = { series: [] };
          }
        },
        immediate: true,
      },
    },
    mounted() {
      this.loadDailyStatistics();
      this.loadMonthlyShift();
      const screenWidthPx = uni.getWindowInfo().windowWidth;
      this.chartWidthPx = screenWidthPx - 40 * 2; // 40px padding
    },
    methods: {
      onMonthChange(e) {
        this.selectedMonth = e.detail.value;
        this.showMonthPicker = false;
      },
      async loadDailyStatistics() {
        const res = await getDailyStatistics(this.selectedMonth);
        // 假设后端返回格式为 [{date, totalKwh, records: [...] }]
        const raw = getPayload(res);
        const rawList = Array.isArray(raw) ? raw : [];
        // 生成当月所有日期
        const [year, month] = this.selectedMonth.split('-');
        const days = new Date(year, month, 0).getDate();
        const dateMap = {};
        rawList.forEach((item) => {
          dateMap[item.date] = item;
        });
        const fullList = [];
        for (let d = 1; d <= days; d++) {
          const dayStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          if (dateMap[dayStr]) {
            fullList.push(dateMap[dayStr]);
          } else {
            fullList.push({ date: dayStr, totalKwh: 0, records: [] });
          }
        }
        this.dailyKwh = fullList;
      },
      async loadMonthlyShift() {
        const res = await getMonthlyShiftStatistics(this.selectedMonth);
        this.shiftPie = getPayload(res) || null;
      },
      getBarHeight(kwh) {
        // 简单映射高度，最大高度120rpx
        const max = Math.max(...this.dailyKwh.map((i) => i.totalKwh), 1);
        return `${Math.round((kwh / max) * 120)}rpx`;
      },
      formatTime(dateStr) {
        // 假设dateStr为"2024-06-01 12:30"
        return dateStr.split(' ')[1] || '';
      },
      formatDay(dateStr) {
        // 只显示年月日
        return dateStr.split('T')[0];
      },
      formatAmount(amount) {
        return `¥${Number(amount).toFixed(2)}`;
      },
      calcBarWidthGap() {
        const days = this.dailyKwh.length || 31;
        const chartWidth = this.chartWidthPx;
        let gap = 4;
        let barWidth = (chartWidth - gap * (days - 1)) / days;
        if (barWidth < 8) {
          barWidth = 8;
          gap = (chartWidth - barWidth * days) / (days - 1);
          if (gap < 1) gap = 1;
        }
        this.chartBarWidth = barWidth;
        this.chartBarGap = gap;
      },
      showTooltip(e, item, index) {
        // 获取柱子在屏幕上的位置
        const barGroup = this.$refs.barGroup;
        if (!barGroup) return;
        // 计算柱子中心点
        const barLeft = index * (this.chartBarWidth + this.chartBarGap) + this.chartBarWidth / 2;
        this.tooltip = {
          show: true,
          left: barLeft,
          date: item.date,
          kwh: item.totalKwh,
        };
      },
      hideTooltip() {
        this.tooltip.show = false;
      },
      shouldShowLabel(index, total) {
        // 每隔5天显示一次，首日和末日也显示
        return index % 5 === 0 || index === total - 1;
      },
      describeArc(cx, cy, r, startAngle, endAngle) {
        // 生成SVG圆弧路径
        const start = this.polarToCartesian(cx, cy, r, endAngle);
        const end = this.polarToCartesian(cx, cy, r, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
        return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
      },
      polarToCartesian(cx, cy, r, angle) {
        const rad = ((angle - 90) * Math.PI) / 180.0;
        return {
          x: cx + r * Math.cos(rad),
          y: cy + r * Math.sin(rad),
        };
      },
      openMonthPicker() {
        this.showMonthPicker = true;
      },
    },
  };
</script>

<style lang="scss">
  @import '@/uni.scss';
  .container {
    @extend .page-bg;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
  .month-bar-row {
    display: flex;
    align-items: center;
    padding: 24rpx 32rpx 0 32rpx;
    font-size: 30rpx;
    color: #ffa500;
    font-weight: bold;
    cursor: pointer;
    position: relative;
    z-index: 10;
  }
  .month-picker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 24rpx;
    height: 56rpx;
    min-width: 120rpx;
    background: #fff7e6;
    border: 2rpx solid #ffa500;
    border-radius: 28rpx;
    font-size: 30rpx;
    color: #ffa500;
    font-weight: bold;
    box-shadow: 0 2rpx 8rpx rgba(255, 165, 0, 0.08);
    cursor: pointer;
    position: relative;
  }
  .month-picker::after {
    content: '';
    display: inline-block;
    margin-left: 10rpx;
    width: 0;
    height: 0;
    border-left: 10rpx solid transparent;
    border-right: 10rpx solid transparent;
    border-top: 10rpx solid #ffa500;
  }
  .chart-card {
    background: #fff;
    border-radius: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
    margin: 16rpx 20rpx 0 20rpx;
    padding: 24rpx 20rpx; // 统一padding，减小顶部间距
  }
  .chart-title {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
    margin-bottom: 16rpx;
  }
  .card-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 12rpx;
    padding: 0 12rpx; // 统一标题内边距
  }
  .shift-pie-card .card-title {
    font-size: 28rpx;
    margin-bottom: 12rpx;
  }
  .chart-bar-group {
    display: flex;
    align-items: flex-end;
    height: 180rpx;
    margin-bottom: 8rpx;
    padding-bottom: 36rpx; // 为标签留空间
  }
  .chart-bar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  .chart-bar {
    width: 36rpx; // 原为24rpx，增大宽度
    background: linear-gradient(135deg, #ffa500 0%, #ffb84d 100%);
    border-radius: 8rpx 8rpx 0 0;
    transition: height 0.2s;
  }
  .chart-bar-label {
    position: absolute;
    bottom: -32rpx;
    left: 50%;
    transform: translateX(-50%) rotate(-45deg);
    font-size: 20rpx;
    color: #888;
    min-width: 40rpx;
    text-align: center;
    white-space: nowrap;
    display: block;
  }
  .chart-empty {
    color: #aaa;
    font-size: 24rpx;
    text-align: center;
    padding: 32rpx 0;
  }
  .records-list {
    margin: 24rpx 20rpx 0 20rpx;
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }
  .record-day-card {
    background: #fff;
    border-radius: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
    margin-bottom: 12rpx;
    padding: 16rpx 12rpx;
  }
  .record-day-header {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 6rpx;
  }
  .record-day-date {
    font-size: 24rpx;
    color: #333;
    font-weight: bold;
  }
  .record-day-kwh {
    margin-left: auto;
    font-size: 22rpx;
    color: #ffa500;
    font-weight: bold;
  }
  .empty-state {
    color: #aaa;
    font-size: 28rpx;
    text-align: center;
    padding: 80rpx 0;
  }
  .chart-tooltip {
    position: absolute;
    top: -60rpx;
    min-width: 100rpx;
    background: #fff;
    color: #ffa500;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
    padding: 8rpx 16rpx;
    font-size: 24rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 10;
    pointer-events: none;
    transform: translateX(-50%);
  }
  .shift-pie-card {
    padding: 24rpx 20rpx; // 统一
  }
  .shift-pie-flex {
    display: flex;
    align-items: center;
    gap: 16rpx;
    flex-wrap: nowrap;
    justify-content: flex-start;
    width: 100%;
    min-height: 200rpx;
    padding-left: 100rpx; // 增加左边间距
    margin-top: 40rpx; // 增加上面间距
    margin-bottom: 16rpx;
  }
  .shift-pie-flex.compact {
    gap: 16rpx;
  }

  .shift-pie-chart-wrapper.small {
    width: 200rpx;
    height: 200rpx;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 24rpx;
    margin-top: 12rpx; // 保持上方空白
  }
  .shift-pie-legend {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    font-size: 22rpx;
    color: #666;
    flex: 1;
    margin-left: 65px;
  }
  .shift-pie-legend.right-legend {
    flex-direction: column;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 22rpx;
    white-space: nowrap; // 保证一行展示
  }
  .legend-dot {
    display: inline-block;
    width: 14rpx;
    height: 14rpx;
    border-radius: 50%;
    margin-right: 4rpx;
  }
  .legend-dot.day {
    background: #ffa500;
  }
  .legend-dot.night {
    background: #409eff;
  }
  .record-list-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
  .one-line-row {
    padding: 16rpx 12rpx;
    margin-bottom: 12rpx;
    background: #fff;
    border-radius: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
  }
  .one-line-header {
    display: flex;
    align-items: center;
    gap: 16rpx;
    flex-wrap: wrap;
  }
  .record-day-date {
    font-size: 24rpx;
    color: #333;
    font-weight: bold;
    margin-right: 12rpx;
  }
  .record-shifts {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-left: auto;
  }
  .shift-item {
    display: flex;
    align-items: center;
    gap: 4rpx;
    padding: 4rpx 10rpx;
    border-radius: 16rpx;
    font-size: 22rpx;
    font-weight: bold;
  }
  .shift-item.day {
    background: #fff7e6;
    color: #ffa500;
  }
  .shift-item.night {
    background: #e6f0ff;
    color: #409eff;
  }
  .shift-item.total {
    background: #f5f5f5;
    color: #222;
  }
  .shift-value {
    margin-right: 0;
  }
</style>
