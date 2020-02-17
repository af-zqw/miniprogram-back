const Router = require('koa-router')
const router = new Router()
const callCloudfn = require('../util/callCloudFn')
const callCloudDB = require('../util/callCloudDB')

//查询歌单列表,调用小程序中的云函数
router.get('/list', async (ctx, next) => {
  const query = ctx.request.query  // get方法获取前端参数的方法
  const dataRes = await callCloudfn(ctx, 'music', {  // 获取数据
    $url: 'playlist',
    start: parseInt(query.start),
    count: parseInt(query.count)
  })
  let data = {}
  if(dataRes.resp_data) {
    data.list = JSON.parse(dataRes.resp_data).data || []
  }
  const totalRes = await callCloudfn(ctx, 'music', {  // 获取数据库总数
    $url: 'palylistCount'
  })
  if(totalRes.resp_data) {
    data.total = JSON.parse(totalRes.resp_data).total || 0
  }
  ctx.body = {
    data,
    code: 20000  // 前端要求的状态码
  }
})

// 查询云数据库
router.get('/getById', async(ctx, next)=>{
  const query = `db.collection('playlist').doc('${ctx.request.query.id}').get()`
  const res = await callCloudDB(ctx, 'databasequery', query)
  ctx.body = {
      code: 20000,
      data: JSON.parse(res.data)
  }
})

// 提交修改歌单信息
router.post('/updatePlaylist', async(ctx, next) => {
  const params = ctx.request.body
  console.log(params)
  const query = `
    db.collection('playlist').doc('${params._id}').update({
      data: {
        name: '${params.name}',
        copywriter: '${params.copywriter}'
      }
    })
  `
  const res = await callCloudDB(ctx, 'databaseupdate', query)
  ctx.body = {
    code: 20000,
    data: res
  }
})

// 删除单条歌单
router.get('/del', async (ctx, next) => {
  const params = ctx.request.query
  const query = `db.collection('playlist').doc('${params.id}').remove()`
  const res = await callCloudDB(ctx, 'databasedelete', query)
  ctx.body = {
    code: 20000,
    data: res 
  }
})

module.exports = router