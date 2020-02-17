const rp = require('request-promise')
const APPID = 'wx2c9c8a904b5b9f1e'
const APPSECRET = 'd77f0de1de7e00954e2315d8543349e0'
const URL = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`

const fs = require('fs')
const path = require('path')
const fileName = path.resolve(__dirname,'./access_token.json')

const updateAccessToken = async () => {
  const resStr = await rp(URL)  // 获取token
  const res = JSON.parse(resStr)
  console.log(res)
  // 写文件
  if(res.access_token){
    fs.writeFileSync(fileName,JSON.stringify({
      access_token:res.access_token,
      createTime: new Date()
    }))
  } else {
    await updateAccessToken()
  }
}

const getAccessToken = async () => {
  // 读取文件
  try {
    const readRes = fs.readFileSync(fileName,'utf-8')
    const readObj = JSON.parse(readRes)

    const createTime = new Date(readObj.createTime).getTime()
    const nowTime = new Date().getTime()
    if((nowTime - createTime) / 1000 / 60 / 60 >= 2) {  // 凭证过期
      await updateAccessToken()
    }
    return readObj.access_token
  } catch (error) {
    await updateAccessToken()
    await getAccessToken()
  }
}

// 差不多两个小时获取一次
setInterval(async () => {
  await updateAccessToken()
}, (7200 - 300) * 1000)

module.exports = getAccessToken