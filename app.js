const Koa = require('koa')
const app = new Koa()
const Router = require('koa-router')
const router = new Router()
const cors = require('koa2-cors')
const koaBody = require('koa-body')

const ENV = 'zqw127-d18253' // 云开发id

// 跨域
app.use(cors({
  origin:['http://localhost:8081'],
  credentials: true
}))

// 接收post参数解析
app.use(koaBody({
  multipart: true
}))

app.use(async (ctx, next) => {  // 全局中间件，写在最前面
  ctx.state.env = ENV
  await next()
})

const playlist = require('./controller/playlist')
const swiper = require('./controller/swiper')
router.use('/playlist',playlist.routes())  // 给路由模块的路径起一个前缀，访问playlist里面的接口都需要加上/playlist前缀
router.use('/swiper', swiper.routes())

app.use(router.routes())
app.use(router.allowedMethods())  // 允许http请求的所有方法

app.listen(3000, () => {
  console.log('服务开启在三千端口')
})