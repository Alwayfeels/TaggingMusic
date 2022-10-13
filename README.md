# TaggingMusic
为你喜欢的音乐标记 tag，快捷根据 tag 生成个性歌单。灵感来自 flomo 

本项目纯属个人兴趣，欢迎star, fork, PR，issue

# 技术栈
## 前端
Vue3(setup-script) + Vite + Pinia + NaiveUI + TailwindCSS + Localforage + vicons
## 后台
[NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) + Vercel部署
# 线上地址
[Beta版本地址](https://tagging-music.vercel.app/)

# 启动
推荐使用 pnpm，减少node_modules体积
```bash
pnpm install
pnpm run dev
```
# 计划

- [x] 入口页使用说明
- [x] 二维码登录 
- [x] 歌单列表展示 
- [x] 歌曲列表展示 
- [x] 标签设置
  - [x] tab / enter 键盘快捷录入
- [x] indexedDB本地存储歌单
  - [x] 导入 / 导出已标记的歌单
- [x] 根据 tag 生成歌单
- [x] 播放音乐
  - [x] 手动调整播放进度
  - [x] 音量控制
  - [x] 播放列表
  - [x] 循环模式 delay
- [ ] 搜索歌曲/用户 
  - [ ] 支持对搜索结果使用 tag
- [ ] 界面美化
  - [x] 使用 pinia 管理全局状态
- [ ] 播放列表点击切换时, 状态回馈到 songlist.active