/**
 * 调用云函数的模板方法
 */
const getAccessToken = require('./getAccessToken')
const rp = require('request-promise')

const callCloudFn = async (ctx, fnName, params) => {
  const ACCESS_TOKEN = await getAccessToken()
   // request-promise post方法的请求形式
  const options = {
    method: 'POST',
    // 外部调用云函数的接口
    uri: `https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=${ACCESS_TOKEN}&env=${ctx.state.env}&name=${fnName}`,
    body: {
      ...params
    },
    json: true
  }

  return await rp(options).then((res) => {
    return res
  }).catch((err) => {
  })
}

module.exports = callCloudFn