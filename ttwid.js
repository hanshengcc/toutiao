const axios = require("axios")
let ttwid = null
let tt_webid = null

async function getTTwid(){
    if(ttwid == null){
        const responseRegister = await axios.post("https://ttwid.bytedance.com/ttwid/union/register/", {
            "aid": 24,
            "service": "www.toutiao.com",
            "region": "cn",
            "union": true,
            "needFid": false
        }, {
            responseType: "json"
        })
        redirect_url = responseRegister.data.redirect_url
    
        const cookieResponse = await axios.get(redirect_url)
        const [subttwid] = cookieResponse.headers["set-cookie"][0].split(";")
        ttwid = subttwid;
    }
    return ttwid;
}


async function getTTwebid(){
    if(tt_webid == null){
        const indexResponse = await axios.get("https://www.toutiao.com",{
            headers:{
                "Cookie": await getTTwid(),
            }
        })
        const [subtt_webid] = indexResponse.headers["set-cookie"][0].split(";")
        tt_webid = subtt_webid;
    }
    return tt_webid
}
let __ac_nonce = null
// let __ac_nonce = "0671935fe00b92ae09b66"
async function getNonce(){
    if(__ac_nonce == null){
        const link = `https://so.toutiao.com/search`
        const response = await axios.get(link)

        __ac_nonce = response.headers["set-cookie"][0].split(";")[0].split("=")[1];
    }

    return __ac_nonce
}
module.exports = {
    getTTwid,
    getTTwebid,
    getNonce
}
