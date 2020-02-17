const Router = require('koa-router')
const router = new Router()
const callCloudfn = require('../util/callCloudFn')
const callCloudDB = require('../util/callCloudDB')
const cloudStorage = require('../util/callCloudStorage')

// 获取数据库的图片，数据库存的是云存储的fileid，通过调用官方接口获取对应的下载链接
router.get('/list', async (ctx, next) => {
  const query = `db.collection('swiper').get()`
  const res = await callCloudDB(ctx, 'databasequery', query)
  // 获取文件下载链接
  let fileList = []
  const data = res.data  // 取到轮播图数据库获取的数据
  if(data.length > 0) {

    for (let i = 0, len = data.length; i < len; i++) {  // 封装传给请求云存储下载链接的文件数组参数
      fileList.push({
        fileid: JSON.parse(data[i]).fileid,
        max_age: 7200
      })
    }

    const dlRes = await cloudStorage.download(ctx, fileList)  // 得到图片的下载地址
    let returnData = []
    for(let i = 0, len = dlRes.file_list.length; i < len; i++) {
      returnData.push({
        download_url: dlRes.file_list[i].download_url,
        fileid: dlRes.file_list[i].fileid,
        _id: JSON.parse(data[i])._id  // 存储在数据库的id
      })
    }
  
    ctx.body = {
      code: 20000,
      data: returnData
    }
  } else {
    ctx.body = {
      code: 20000,
      data: []
    }
  }
})

// 上传图片
router.post('/upload', async (ctx, next) => {
  const fileid = await cloudStorage.upload(ctx)
  console.log(fileid)
  // 写数据库
  const query = `
    db.collection('swiper').add({
      data: {
        fileid: '${fileid}'
      }
    })
  `
  const res = await callCloudDB(ctx, 'databaseadd', query)
  ctx.body = {
    code: 20000,
    data: res.id_list
  }
})

// 删除图片
router.get('/del', async (ctx, next) => {
  const params = ctx.request.query
  // 删除云数据库
  const query = `db.collection('swiper').doc('${params._id}').remove()`
  const delDBRes = await callCloudDB(ctx, 'databasedelete', query)

  // 删除云存储的图片
  const delStorageRes = await cloudStorage.delete(ctx, [params.fileid])
  ctx.body = {
    code: 20000,
    data: {
      delDBRes,
      delStorageRes
    }
  }
})

module.exports = router