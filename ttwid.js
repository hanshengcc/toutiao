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
    console.log(new Date().toLocaleString(),` ttwid:`,ttwid)
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
    console.log(new Date().toLocaleString(),` tt_webid:`,tt_webid)
    return tt_webid
}
let __ac_nonce = null
// let __ac_nonce = "0671935fe00b92ae09b66"
async function getNonce(){
    if(__ac_nonce == null){
        const link = `https://so.toutiao.com/search?dvpf=pc&source=search_subtab_switch&keyword=%E7%8B%AC%E8%A1%8C%E6%9C%88%E7%90%83&pd=information&action_type=search_subtab_switch&page_num=0&search_id=&from=news&cur_tab_title=news`
        const response = await axios.get(link,{
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0"
            }
        })

        __ac_nonce = response.headers["set-cookie"]?.[0]?.split(";")?.[0]?.split("=")?.[1] ?? response.data.match(/nonce="([^"]+)"/)[1] ?? "0671935fe00b92ae09b66"
    }
    console.log(new Date().toLocaleString(),` __ac_nonce:`,__ac_nonce)
    return __ac_nonce
}
module.exports = {
    getTTwid,
    getTTwebid,
    getNonce
}
