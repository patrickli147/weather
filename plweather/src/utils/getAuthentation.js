//this is used for getting authentation from user with a given scope value
export default (authName)=> {
    //wx's scope list keys
    var scopeList = [
        "userInfo",
        "userLocation",
        "userLocationBackground",
        "address",
        "invoiceTitle",
        "invoice",
        "werun",
        "record",
        "writePhotosAlbum",
        "camera"
    ];

    return new Promise((resolve, reject)=> {
        if (scopeList.indexOf(authName) < 0) {
            //given param is not in the list above
            reject("wrong input");
        }
        else {
            //correct input
            let authParam = "scope." + authName;
            wx.getSetting({
                success: (result)=>{
                    if (!result.authSetting[authParam]) {
                        //user hasn't given authentation
                        wx.authorize({
                            scope: authParam,
                            success: ()=>{
                                resolve("success");
                            },
                            fail: ()=>{
                                reject("authorize fail:user denied");
                            }
                        });
                    }
                    else {
                        //user has already given authentation
                        resolve("already");
                    }
                },
                fail: ()=>{
                    reject("get setting fail");
                }
            });
        }
    });

}