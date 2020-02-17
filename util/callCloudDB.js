/**
 * 调用云数据库的模板方法
 */
const getAccessToken = require('./getAccessToken')
const rp = require('request-promise')

const callCloudDB = async (ctx, fnName, query = {}) => {
  const ACCESS_TOKEN = await getAccessToken()
  const options = {
    method: 'POST',
    /**
     * 请求云数据库的接口,fnName代表增删改查其中一个方法
     * access_token拼接在地址中
     * post传query(数据库查询语句)和env(云环境ID)
     */
    uri: `https://api.weixin.qq.com/tcb/${fnName}?access_token=${ACCESS_TOKEN}`,
    body: {
      query,
      env: ctx.state.env
    },
    json: true
  }

  return await rp(options).then((res) => {
    return res
  })
}

module.exports = callCloudDB