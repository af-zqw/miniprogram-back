/**
 * 调用云存储模板方法
 */
const getAccessToken = require('./getAccessToken')
const rp = require('request-promise')
const fs = require('fs')

const cloudStorage = {
  async download(ctx, fileList) {  // 下载方法
    console.log(fileList)
    const ACCESS_TOKEN = await getAccessToken()
    /**
     * 下载云存储图片的方法,参数env和file_list写在body里面
     * file_list为数组，数组项为对象，包含fileid(文件在云存储的fileId),max_age(下载链接有效期
),并且不能为空数组
     * 请求成功后就可以得到每张图片的下载地址，能直接在浏览器访问
     */
    const options = {
      method: 'POST',
      uri: `https://api.weixin.qq.com/tcb/batchdownloadfile?access_token=${ACCESS_TOKEN}`,
      body: {
        env: ctx.state.env,
        file_list: fileList
      },
      json: true
    }
    return await rp(options).then((res) => {
      return res
    })
  },

  /**
   * 上传图片的方法，需要分为两步
   * 1.先获取请求地址
   * 2.根据获取的请求地址里面的信息再发送一个post请求才能上传成功
   * 文档:https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-http-api/storage/uploadFile.html
   */
  async upload(ctx) {
    const ACCESS_TOKEN = await getAccessToken()
    // 1.请求地址
    const file = ctx.request.files.file // 前端传过来的文件名
    const path = `swiper/${Date.now()}-${Math.random()}-${file.name}`
    const options = {
      /**
       * 上传到云存储的方法
       * path为文件存到云存储的路径
       */
      method: 'POST',
      uri: `https://api.weixin.qq.com/tcb/uploadfile?access_token=${ACCESS_TOKEN}`,
      body: {
        path,
        env: ctx.state.env
      },
      json: true
    }
    const info = await rp(options).then((res) => {
      return res
    })
    // 2.上传图片
    const params = {
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data'
      },
      uri: info.url,
      formData: {
        key: path,
        Signature: info.authorization,
        'x-cos-security-token': info.token,
        'x-cos-meta-fileid': info.cos_file_id,
        file: fs.createReadStream(file.path)  // 转为二进制
      },
      json: true
    }
    await rp(params)
    return info.file_id
  },

  async delete(ctx, fileid_list) {
    const ACCESS_TOKEN = await getAccessToken()
    const options = {
      method: 'POST',
      uri: `https://api.weixin.qq.com/tcb/batchdeletefile?access_token=${ACCESS_TOKEN}`,
      body: {
        env: ctx.state.env,
        fileid_list: fileid_list
      },
      json: true
    }
    return await rp(options).then((res) => {
      return res
    })
  }
}

module.exports = cloudStorage