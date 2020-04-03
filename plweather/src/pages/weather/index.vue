<template>
    <scroll-view 
        scroll-y="true" 
        enable-flex="true" 
        v-if="cities.length > 0" 
        class="weather-wrap" 
        :data-bg="currentCity.data[0].wea_img"
        refresher-enabled="true"
        @refresherrefresh="getData"
        :refresher-triggered="triggered"
    >
        <swiper-action 
            @swiperAction="handleSwiperAction"
            :scroll-touch="isScrollTouch"
        >
            <!-- 天气头部 开始 -->
            <view class="weather-head-wrap">
                <view class="head-city" @click="backToCityList">
                    {{currentCity.city}}
                </view>
                <view class="head-weather">
                    {{currentCity.data[0].wea}}
                </view>
                <view class="head-tem">
                    {{currentCity.data[0].tem}}
                </view>
            </view>
            <!-- 天气头部 结束 -->

            <!-- 今日天气 开始 -->
            <view class="weather-today-wrap">
                <view class="today-week">
                    {{currentCity.data[0].week}}
                </view>
                <view class="today-high">
                    {{currentCity.data[0].tem1}}
                </view>
                <view class="today-low">
                    {{currentCity.data[0].tem2}}
                </view>
            </view>
            <!-- 今日天气 结束 -->

            <!-- 时刻天气 开始 -->
            <view class="weather-hour-wrap"
                @touchstart="handleScrollXTouch($event)"
            >
                <view class="hour-content"
                    v-for="item in currentCity.data[0].hours"
                    :key="item.day"
                >
                    <view class="hour-day">
                        {{item.day}}
                    </view>
                    <view class="hour-wea">
                        {{item.wea}}
                    </view>
                    <view class="hour-tem">
                        {{item.tem}}
                    </view>
                    <view class="hour-win">
                        {{item.win}}
                    </view>
                    <view class="hour-win_speed">
                        {{item.win_speed}}
                    </view>
                </view>
            </view>
            <!-- 时刻天气 结束 -->

            <!-- 未来天气 开始 -->
            <view class="weather-future-wrap">
                <view class="future-content"
                    v-for="item in futureWeather"
                    :key="item.date"
                >
                    <view class="future-week">
                        {{item.week}}
                    </view>
                    <view class="future-weather">
                        {{item.wea}}
                    </view>
                    <view class="future-high">
                        {{item.tem1}}
                    </view>
                    <view class="future-low">
                        {{item.tem2}}
                    </view>
                </view>
            </view>
            <!-- 未来天气 结束 -->

            <!-- 湿度 开始 -->
            <view class="weather-condition-wrap">
                <view class="condition-title">
                    湿度
                </view>
                <view class="condition-level">
                    {{currentCity.data[0].humidity}}
                </view>
            </view>
            <!-- 湿度 结束 -->

            <!-- 风向 开始 -->
            <view class="weather-condition-wrap">
                <view class="condition-title">
                    <view v-if="currentCity.data[0].win.length === 1 || currentCity.data[0].win[0] === currentCity.data[0].win[1]">
                        {{currentCity.data[0].win[0]}}
                    </view>
                    <view v-else>
                        {{currentCity.data[0].win[0]}}转{{currentCity.data[0].win[1]}}
                    </view>
                </view>
                <view class="condition-level">
                    {{currentCity.data[0].win_speed}}
                </view>
            </view>
            <!-- 风向 结束 -->

            <!-- 空气质量 开始 -->
            <view class="weather-condition-wrap">
                <view class="condition-title">
                    空气指数
                </view>
                <view class="condition-level">
                    {{currentCity.data[0].air}}
                </view>
                <view class="condition-desc">
                    空气质量：{{currentCity.data[0].air_level}}。{{currentCity.data[0].air_tips}}
                </view>
            </view>
            <!-- 空气质量 结束 -->

            <!-- 生活指数 开始 -->
            <view class="weather-level-wrap">
                <view class="weather-level-content"
                    v-for="item in legalIndex"
                    :key="item.title"
                >
                    <view class="weather-condition-wrap">
                        <view class="condition-title">
                            {{item.title}}
                        </view>
                        <view class="condition-level">
                            {{item.level}}
                        </view>
                        <view class="condition-desc">
                            {{item.desc}}
                        </view>
                    </view>
                </view>
            </view>
            <!-- 空气指数 结束 -->

            <!-- logo 开始 -->
            <view class="logo">
                <image src="../../static/icons/weaSelected.png"></image>
            </view>
            <!-- logo 结束 -->

        </swiper-action>
    </scroll-view>
</template>

<script>
import swiperAction from '@/components/swiperAction';

export default {
    onLoad(options) {
        const {cities} = getApp().globalData;
        this.cities = cities;

        console.log(options);
        this.currentIndex = parseInt(options.index);

        //open share
        wx.showShareMenu({
            withShareTicket: false,
            success: (result)=>{
                console.log("show share menu")
            },
            fail: ()=>{},
            complete: ()=>{}
        });
    },
    data() {
        return {
            //params needed to request data
            params: {
                appid:33879898,
                appsecret:"YWL6vpDX",
                version: "v1",
                city:""
            },
            //weather data of cities
            cities:[],
            //current index of cities
            currentIndex: 0,
            //is scroll x touch
            isScrollTouch: false,
            //true when refresher triggered
            triggered:false
        }
    },
    computed: {
        //current city to show
        currentCity: function() {
            return this.cities[this.currentIndex];
        },
        //future weather data
        futureWeather: function() {
            if (this.currentCity) {
                return this.cities[this.currentIndex].data.slice(1);
            }
            else {
                return [];
            }
        },
        //legal weather index
        legalIndex: function() {
            if (this.currentCity) {
                return this.currentCity.data[0].index.filter(x=>{
                    return x.level !== null;
                });
            }
            else {
                return [];
            }
        }
    },
    components: {
        swiperAction
    },
    methods: {
        //handle swiper action to change city
        handleSwiperAction(event) {
            if (event.direction === "fromParent") {
                this.isScrollTouch = false;
                return;
            }

            var direction = event.direction;
            if (direction === "left") {
                if (this.currentIndex === this.cities.length - 1) {
                    uni.showToast({
                        title:"没有数据了",
                        icon:"none"
                    });
                }
                else {
                    this.currentIndex ++;
                }
            }
            else {
                if (this.currentIndex === 0) {
                    uni.showToast({
                        title:"没有数据了",
                        icon:"none"
                    });
                }
                else {
                    this.currentIndex --;
                }
            }
        },
        //if touchStart event if from 
        handleScrollXTouch(event) {
            //console.log(event);
            this.isScrollTouch = true;
        },
        //redirect to city/index.vue
        backToCityList() {
            //update global data
            getApp().globalData.cities = this.cities;

            uni.navigateBack();
        },
        //get data with a given name
        getData() {
            //console.log(this.triggered); //false
            this.triggered = true;

            this.params.city = this.currentCity.city;
            this.request({
                url:"https://tianqiapi.com/api",
                data:this.params
            }).then(res=>{
                if (res.errcode === 100) {
                    uni.showToast({
                        title:"访问次数过高",
                        icon:"none"
                    });
                }
                else {
                    this.cities[this.currentIndex] = res;
                    uni.showToast({
                        title:"刷新成功",
                        icon:"none"
                    });
                }
                this.triggered = false;
            }).catch(err=> {
                console.log(err);
                uni.showToast({
                        title:"网络缓慢,稍后再试",
                        icon:"none"
                    });
                this.triggered = false;
            });
        }
    }
}
</script>

<style lang="scss" scoped>
//set background
@import '..//../styles/_setbg.scss';
//整体 
.weather-wrap {
    background-repeat: no-repeat;
    background-size: cover;
    background-position: 0% 0%;
    //test 
    height: 100vh;
}


//天气头部
.weather-head-wrap {
    text-align: center;
    padding-top: 10%;
    padding-bottom: 10%;
  .head-city {
      font-size: 45rpx;
      font-weight: 600;
  }

  .head-weather {
      font-size: 30rpx;
  }

  .head-tem {
      font-size: 100rpx;
      padding: 2%;
  }
}

//今日天气
.weather-today-wrap {
    border-bottom: 3rpx solid #eee;
    padding: 2% 5%;

    display: flex;
    justify-content: center;
    align-items: center;
  .today-week {
      width: 70%;
      text-align: left;
  }

  .today-high {
      width: 15%;
      text-align: right;
  }

  .today-low {
      width: 15%;
      text-align: right;
      opacity: 0.8;
  }
}

//时刻天气
.weather-hour-wrap {
    border-bottom: 3rpx solid #eee;
    padding: 2% 5%;

    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: nowrap;
    overflow: scroll;
  .hour-content {
      width: 33.33%;
      //padding: 2%;
      font-size: 35rpx;
      flex-shrink: 0;
      text-align: center;
    .hour-day {

    }

    .hour-wea {

    }

    .hour-tem {

    }

    .hour-win {

    }

    .hour-win_speed {

    }
  }
}

//未来天气
.weather-future-wrap {
    border-bottom: 3rpx solid #eee;
    padding: 2% 5%;

    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  .future-content {
      width: 100%;

      display: flex;
      justify-content: center;
      align-items: center;
    .future-week {
        width: 20%;
        text-align: left;
    }

    .future-weather {
        width: 50%;
        text-align: center;
    }

    .future-high {
        width: 15%;
        text-align: right;
    }

    .future-low {
        width: 15%;
        text-align: right;
        opacity: 0.8;
    }
  }
}

//通用 天气详情描述布局
.weather-condition-wrap {
    border-bottom: 3rpx solid #eee;
    padding: 2% 5%;
    
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;  
    .condition-title {
        width: 50%;
        text-align: left;
    }

    .condition-level {
        width: 50%;
        text-align: right;
    }

    .condition-desc {
        width: 100%;
        font-size: 30rpx;
        opacity: 0.8;
    }

}

//logo
.logo {
    padding-top: 10%;
    padding-bottom: 3%;

    display: flex;
    justify-content: center;
    align-items: center;
  image {
    width: 70rpx;
    height: 70rpx;
  }
}

</style>