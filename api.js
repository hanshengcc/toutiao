const express = require('express');
const {getLink} = require("./bd.js")
const axios = require("axios")
const {JSDOM} = require("jsdom")
const {
    getTTwid,
    getTTwebid,
    getNonce
} = require("./ttwid.js")

const {
    getsignature,
} = require("./sign.js")



const channels = {
    // 财经
    finance: '3189399007',
    // 科技
    technology: '3189398999',
    //热点
    hot: '3189398996',
    // 国际
    international: '3189398968',
    // 军事
    military: '3189398960',
    // 体育
    sports: '3189398957',
    // 娱乐
    entertainment: '3189398972',
    // 数码
    digital: '3189398981',
    // 历史
    history: '3189398965',
    // 美食
    food: '3189399002',
    // 游戏
    games: '3189398995',
    // 旅游
    travel: '3189398983',
    // 养生
    health: '3189398959',
    // 时尚
    fashion: '3189398984',
    // 育儿
    parenting: '3189399004',
    // 视频
    video: '3431225546',
}

const app = express()
app.get('/', (req, res) => {
    return res.json(channels)
})


let tt_webid = null;
let ttwid = null;

app.get('/channel/:id', async (req, res) => {
    const ttwid = await getTTwid()
    const tt_webid = await getTTwebid()

    const link = await getLink(req.params.id)

    const response = await axios.get(link, {
        responseType: "json", headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
            "Cookie": tt_webid
        },
        // httpsAgent: new https.Agent({
        //     rejectUnauthorized:false
        // })
    })



    if (response.data?.message == "success") {
        acticlePromises = response.data?.data.map(async post => {
            try {
                const htmlResponse = await axios.get(post.article_url, {
                    responseType: "text", headers: {
                        "Cookie": ttwid.trim(),
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0"
                    }
                })

                const { window: { document } } = new JSDOM(htmlResponse.data)
                // console.log(document.title)
                const title = document.querySelector("h1")?.textContent
                const article = document.querySelector("article")?.outerHTML

                post.title = title
                post.article = article
                return post
            } catch (ex) {
                return post
            }
        })

        const articles = await Promise.all(acticlePromises)
        // console.log('articles',articles)

        return res.json(articles)
    }

    return res.status(500).send("头条返回无效响应")
})

app.get('/search/:kw', async (req,res) => {
    const word = req.params.kw
    const response = await axios.get(`https://so.toutiao.com/search?dvpf=pc&source=input&keyword=${word}&pd=information&action_type=pagination&page_num=0&from=news&cur_tab_title=news`,{
        headers:{
            "Cookie": `__ac_signature=${await getsignature()};__ac_nonce=${await getNonce()}`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0"
        },
        responseType: "text"
    })
    // console.log(response.request._header)
    // console.log(response.data)
    const {window:{document}} = new JSDOM(response.data)

    // document.querySelectorAll(".result-content").map(node => {
    //     console.log(node.textContent)
    // })

    // console.log("title:",document.title)

    const resultsPromise = [...document.querySelectorAll(".result-content[data-i]")].map(async node => {
        const searchTitle = node.querySelector(".cs-header").textContent;
        const link = node.querySelector(".cs-header").querySelector("a").getAttribute("href");

        const tempUrl = new URL("https://so.toutiao.com"+link)

        const response = await axios.get(tempUrl.searchParams.get("url"),{
            headers: {
                "Cookie": `${await getTTwid()}`,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0"
            },
        })
        // console.log(response.request._header)
        
        const {window:{document:artdocument}} = new JSDOM(response.data)

        const title = artdocument.querySelector("h1").textContent
        const article = artdocument.querySelector("article").outerHTML

        return {searchTitle,title,article}
    })
    
    return res.json(await Promise.all(resultsPromise))
})

const port = process.env.port ?? 3899
console.log("server start at ", port, " default: 3899")
app.listen(port)