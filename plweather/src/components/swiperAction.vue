<template>
    <view
        @touchstart="handleTouchstart"
        @touchend="handleTouchend"
    >
        <slot></slot>
    </view>
</template>

<script>

export default {
    data(){
        return{
            //按下屏幕时的时间
            startTime:0,
            //按下屏幕时的坐标
            startX:0,
            startY:0,
            isFromParent: this.scrollTouch
        }
    },
    methods:{
        handleTouchstart(event){
            this.startTime = Date.now();
            this.startX = event.changedTouches[0].clientX;
            this.startY = event.changedTouches[0].clientY;
            //console.log("zhe li zai chuli")
            //console.log(event.target);
        },
        handleTouchend(event){
            const endTime = Date.now();
            const endX = event.changedTouches[0].clientX;
            const endY = event.changedTouches[0].clientY;

            //判断按下时长是否合法
            if (endTime - this.startTime > 2000) {
                //非法时长视为无效操作
                return;
            }

            //滑动方向
            let direction = "";

            if (this.isFromParent) {
                direction = "fromParent";
                this.$emit("swiperAction", {direction});
                return;
            }

            //判断滑动距离是否合法 是否为水平滑动
            if (Math.abs(endX - this.startX) > 10 && Math.abs(endY - this.startY) < Math.abs(endX - this.startX)) {
                //距离合法，判断滑动方向
                direction = (endX - this.startX) > 0 ? "right" : "left";
            } else {
                //距离不合法
                return;
            }

            //console.log(direction);
            this.$emit("swiperAction", {direction});
        }
    },
    props: [
        'scrollTouch'
    ],
    watch: {
        scrollTouch: function() {
            //监听父组件的变化
            this.isFromParent = this.scrollTouch;
        }
    }
}
</script>

<style lang="scss" scoped>

</style>