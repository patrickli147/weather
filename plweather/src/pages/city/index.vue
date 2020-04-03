<template>
    <view>
        <!-- 城市列表 开始 -->
        <view class="city-item-wrap" v-if="cityOrAdd">
            <view class="city-item"
                v-for="(item, index) in cities"
                :key="item.city"
                enable-flex="true"
                scroll-x="true"
                :data-bg="item.data[0].wea_img"
            >
                <navigator
                    :url="`/pages/weather/index?index=${index}`"
                    class="city-item-content"
                >
                    <view class="city-name">{{item.city}}</view>
                    <view class="city-tem">{{item.data[0].tem}}</view>
                </navigator>
                <view class="city-item-delete" @click="deleteCity(index)">
                    <image src="../../static/icons/delete.png"></image>
                </view>
            </view>
            <view class="city-item-add" @click="showAddCity">
                <image src="../../static/icons/add.png"></image>
            </view>
        </view>
        <!-- 城市列表 结束 -->

        <!-- 添加城市 开始 -->
        <view class="add-city-wrap" v-else>
            <view class="search-input-wrap">
                <view class="search-icon">
                    <image src="../../static/icons/search.png"></image>
                </view>
                <view class="search-input">
                    <input placeholder="请输入城市名称" @confirm="inputConFirm($event)" confirm-type="search">
                </view>
                <view class="search-cancel" @click="backToCity">
                    取消
                </view>
            </view>

            <view class="hot-city-wrap">
                <view class="hot-city-title">热门城市</view>
                <view class="hot-city-item"
                    v-for="(item, index) in hotCities"
                    :key="item"
                    @click="hotCityClick(index)"
                >
                    {{item}}
                </view>
            </view>

            <view class="histories-wrap">
                <view class="histories-title">历史搜索</view>
                <view class="histories-item"
                    v-for="(item, index) in histories"
                    :key="item"
                    @click="historiesClick(index)"
                >
                    {{item}}
                </view>
                <view class="histories-empty" v-if="histories.length === 0">暂无历史记录</view>
                <view class="clear-histories" v-else @click="clearHistories">
                    清除历史记录
                </view>
            </view>       
        </view>
        <!-- 添加城市 结束 -->
    </view>
</template>

<script>
export default {
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
            //history of search 
            histories:[
                
            ],
            //true: show city data, false: show add city
            cityOrAdd: true,
            //hot cities in search
            hotCities:[
                "北京",
                "上海",
                "广州",
                "深圳",
                "厦门",
                "成都",
                "重庆",
                "长春",
                "杭州"
            ]
        }
    },
    onLoad() {
        //update data when onload
        //this.upDateData();
        uni.getStorageInfo({
            success: function (res) {
                console.log(res.keys);
                console.log(res.currentSize);
                console.log(res.limitSize);
            }
        });

        this.readFromStorage();
    },
    onShow() {
        if (getApp().globalData.cities) {
            //console.log(getApp().globalData.cities);
            //get global data: there might be some update in weather page
            this.cities = getApp().globalData.cities;
        }
    },
    onHide() {
        this.writeToStorage('cities-data', this.cities);
        this.writeToStorage('histories-data', this.histories);
        //console.log("on hide read");

        //set global data
        getApp().globalData.cities = this.cities;
    },
    onPullDownRefresh() {
        this.upDateData().then(()=>{
            uni.showToast({
                title:"刷新成功",
                icon:"none"
            });
            uni.stopPullDownRefresh();
        });
    },
    methods: {
        /*
        * get data of cities 
        * cityIndex=-1: add city  else update current city data
        * cityName === "": get data with ip
        */
        getData(cityName, cityIndex) {
            this.params.city = cityName;
            this.request({
                url:"https://tianqiapi.com/api",
                data:this.params
            }).then(result=> {
                

                //console.log(result);
                if (cityName !== "") {
                    //with cityname input
                    if (result.city !== cityName) {
                        if (result.errcode === 100) {
                            uni.showToast({
                                title:"访问次数过高",
                                icon:"none"
                            });
                        }
                        else {
                            //wrong input name
                            uni.showToast({
                                title:"请输入正确的城市名称",
                                icon:"none"
                            });
                        }                        
                    }
                    else {
                        if (cityIndex === -1) {
                            //add city
                            //update search history list
                            var historyIndex = this.histories.indexOf(result.city);
                            if (historyIndex > -1) {
                                this.histories.splice(historyIndex, 1);
                            }
                            this.histories.unshift(result.city);
                            if (this.histories.length > 9) {
                                this.histories.length = 9;
                            }

                            //judge if there exists the same city
                            let isExisted = false;
                            for (let i = 0; i < this.cities.length; i ++) {
                                if (this.cities[i].city === result.city) {
                                    isExisted = true;
                                    break;
                                }
                            }

                            if (isExisted) {
                                //exists
                                uni.showToast({
                                    title:"该城市已存在",
                                    icon:"none"
                                });
                            }
                            else {
                                //not exists
                                this.cities.push(result);
                                uni.showToast({
                                    title:"添加成功",
                                    icon:'none'
                                });
                                
                                //back to city data 
                                this.backToCity();
                            }
                        }
                        else {
                            //get with given city name
                            this.cities[cityIndex] = result;
                        }
                    }
                }
                else {
                    //get ip city data and add
                    this.cities.push(result);
                }
            }).catch(reason=> {
                console.log(reason);
                uni.showToast({
                    title:"网络缓慢,稍后再试",
                    icon:"none"
                });
            });
        },
        //read data from storage
        readFromStorage() {
            var that = this;
            uni.getStorage({
                key:'cities-data',
                success(res) {
                    console.log(res.data);
                    that.cities = res.data;

                    //updata lastest data
                    that.upDateData();
                },
                fail(err) {
                    console.log(err);
                }
            });
            uni.getStorage({
                key:'histories-data',
                success(res) {
                    console.log(res.data);
                    that.histories = res.data;
                },
                fail(err) {
                    console.log(err);
                }
            });
        },
        //write data to storage
        writeToStorage(givenKey ,givenData) {
            console.log(givenData);
            uni.setStorage({
                key:givenKey,
                data:givenData,
                success(res) {
                    console.log("write to storage succ");
                    console.log(res);
                },
                fail(err) {
                    console.log("write to storage fail");
                    console.log(err);
                }
            });
        },
        //updata all the data of cities
        async upDateData() {
            //console.log("update")
            if (this.cities.length === 0) {
                //get data according to user's ip params.city="" automatically
                await this.getData("", -1);
                console.log("add ip");
            }
            else {
                //there're cities need to update
                for (let i = 0; i < this.cities.length; i ++) {
                    await this.getData(this.cities[i].city, i);
                }
            }
        },
        //delete city
        deleteCity(index) {
            this.cities.splice(index, 1);
        },
        //show add city view
        showAddCity() {
            //for test
            //this.getData("", -1);

            this.cityOrAdd = false;
        },
        //search input confirm
        inputConFirm(event) {
            //console.log(event.detail.value);
            var inputCityName = event.detail.value;
            if (inputCityName.length === 0) {
                //do nothing when user clear input area
                return;
            }
            inputCityName =  inputCityName.replace(/(省|市|区)/g, "");
            //console.log(inputCityName);

            this.handleSearchCity(inputCityName);
        },
        //handle search city
        handleSearchCity(cityName) {
            this.getData(cityName, -1);
        },
        //back to city
        backToCity() {
            this.cityOrAdd = true;
        },
        //hot city click
        hotCityClick(index) {
            var cityName = this.hotCities[index];
            this.handleSearchCity(cityName);
        },
        //histories click
        historiesClick(index) {
            var cityName = this.histories[index];
            this.handleSearchCity(cityName);
        },
        //clear histories
        clearHistories() {
            var that = this;
            uni.showModal({
                content:"是否清除历史搜索记录？",
                success(res) {
                    if (res.confirm) {
                        that.histories = [];
                        that.writeToStorage('histories-data', that.histories);
                    }
                }
            });
        }
    }
}
</script>

<style lang="scss" scoped>
//set background
@import '..//../styles/_setbg.scss';

//城市列表
.city-item-wrap {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
  .city-item {
      width: 100%;
      border-bottom: 3rpx solid #eee;
      overflow: scroll;
      background-repeat: no-repeat;
      background-size: cover;

      display: flex;
      justify-content: flex-start;
      align-items: center;
    .city-item-content {
        width: 100%;
        height: 100%;
        flex-shrink: 0;
        padding: 5%;

        display: flex;
        justify-content: center;
        align-items: center;
      .city-name {
          font-size: 70rpx;
          font-weight: 600;
          width: 80%;
          text-align: left;
      }

      .city-tem {
          font-size: 50rpx;
          width: 20%;
          text-align: right;
      }
    }

    .city-item-delete {
        width: 20%;
        height: 100%;
        flex-shrink: 0;
        
        display: flex;
        justify-content: center;
        align-items: center;
        //background-color: rgba(0, 0, 0, 0.753);
      image {
        width: 80rpx;
        height: 80rpx;
      }
    }
  }

  .city-item-add {
      width: 100%;

      display: flex;
      justify-content: flex-end;
      padding: 5%;
      border-bottom: 3rpx solid #eee;
    image {
        width: 100rpx;
        height: 100rpx;
    }
  }
}

//添加城市
.add-city-wrap {
    background: rgba($color: #000000, $alpha: 0.75);
    //height: 100vh;
  .search-input-wrap {
      border-bottom: 3rpx solid #eee;
      padding: 5%;
      font-size: 50rpx;

      display: flex;
      justify-content: center;
      align-items: center;
    .search-icon {
        width: 10%;
        //padding-right: 2%;
      image {
          width: 50rpx;
          height: 50rpx;
      }
    }

    .search-input {
        width: 70%;
      input {
          height: 100%;
      }
    }

    .search-cancel {
        width: 20%;
        text-align: center;
        background: #000;
        border-radius: 5%;
    }
  }

  .hot-city-wrap {
      padding: 5%;
      border-bottom: 3rpx solid #eee;

      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;

    .hot-city-title {
        padding-bottom: 5%;
        font-size: 55rpx;
        font-weight: 600;
        text-align: left;
        width: 100%;
    }

    .hot-city-item {
        font-size: 40rpx;
        text-align: center;
        border: 2rpx #fff solid;
        border-radius: 5%;
        width: 26%;
        margin: 2%;
    }
  }

  .histories-wrap {
      padding: 5%;
      border-bottom: 3rpx solid #eee;

      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
    .histories-title {
        padding-bottom: 5%;
        font-size: 55rpx;
        font-weight: 600;
        text-align: left;
        width: 100%;
    }

    .histories-item {
        font-size: 40rpx;
        text-align: center;
        border: 2rpx #fff solid;
        border-radius: 5%;
        width: 26%;
        margin: 2%;
    }

    .histories-empty {
        font-size: 40rpx;
        width: 100%;
        text-align: center;
    }

    .clear-histories {
        width: 100%;
        text-align: center;
        padding: 5%;
        font-size: 30rpx;
    }
  }
}

</style>