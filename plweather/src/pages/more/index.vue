<template>
    <view class="more-wrap">
        <view class="test-location">
            <button 
                open-type="getUserInfo" 
                @getuserinfo="handleGetuserinfo"
                lang="zh_CN"
            >点我获取用户信息</button>
            <button @click="handleOpenSetting">点击设置</button>
            <button @click="handleLogin" draggable="true">王俊峰</button>
        </view>

        <!-- 用户信息 开始 -->
        <view class="user-info-wrap">
            <view class="user-avatar">
                <image :src="userInfo.avatarUrl"></image>
            </view>
            <view class="user-nick-name">
                {{userInfo.nickName}}
            </view>
        </view>
        <!-- 用户信息 结束 -->
    </view>
</template>

<script>
import getAuthentation from '../../utils/getAuthentation';

export default {
    onLoad() {
        
    },
    data() {
        return {
            //location name
            locationName:"",
            //user information
            userInfo:{}
        }
    },
    methods: {
        //this is for test
        test() {
            uni.getLocation({
                type: 'gcj02', //返回可以用于uni.openLocation的经纬度
                altitude: true, //高度信息
                success: function (res) {
                    const latitude = res.latitude;
                    const longitude = res.longitude;
                    console.log(res);
                    uni.openLocation({
                        latitude: latitude,
                        longitude: longitude,
                        success: function () {
                            console.log('success');
                        }
                    });
                }
            });


            // console.log(getAuthentation);
            // getAuthentation("invoice").then(res1=>{
            //     //get success
            //     console.log(res1);
            //     wx.getUserInfo({
            //         success: function(res) {
            //             this.userInfo = res.userInfo;
            //         }
            //     });
            // },res2=>{
            //     console.log(res2);
            // });

        },
        //handleGetuserinfo
        handleGetuserinfo(event) {
            console.log(event.detail);
            this.userInfo = event.detail.userInfo;
        },
        //handleOpenSetting
        handleOpenSetting() {
            uni.openSetting({
                success(res) {
                    console.log(res);
                }
            });
        },
        handleLogin() {
            wx.updateShareMenu({
                withShareTicket: false,
                success: (result)=>{
                    console.log("succ");
                    wx.showShareMenu({
                        withShareTicket: false,
                        success: (result)=>{
                            console.log("show share menu");
                        },
                        fail: ()=>{},
                        complete: ()=>{}
                    });
                },
                fail: ()=>{},
                complete: ()=>{}
            });
        }
    }
}
</script>

<style lang="scss" scoped>
//test
.more-wrap {
    background-color: #000;
}

//用户信息
.user-info-wrap {

    display: flex;
    justify-content: center;
    align-items: center;
  .user-avatar {
    image {
        width: 100rpx;
        height: 100rpx;
    }
  }

  .user-nick-name {
      width: 80%;
      font-size: 45rpx;
      font-weight: 600;
  }
}
</style>