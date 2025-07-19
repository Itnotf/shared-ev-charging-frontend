<template>
  <div class="svg-icon" :style="iconStyle">
    <uni-icons v-if="useUniIcons" :type="name" :size="size" :color="color"></uni-icons>
    <img v-else-if="name" :src="iconSrc" :alt="name" class="svg-icon-img" />
  </div>
</template>

<script>
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';

export default {
  name: 'SvgIcon',
  components: {
    UniIcons
  },
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: [Number, String],
      default: 24
    },
    color: {
      type: String,
      default: ''
    },
    useUniIcons: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    iconSrc() {
      return `/static/icons/${this.name}.svg`;
    },
    iconStyle() {
      const size = typeof this.size === 'number' ? `${this.size}rpx` : this.size;
      return {
        width: size,
        height: size,
        color: this.color
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.svg-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  .svg-icon-img {
    width: 100%;
    height: 100%;
  }
}
</style> 