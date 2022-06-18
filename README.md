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
- [x] 二维码登陆 
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
  - [ ] 播放列表
  - [ ] 循环模式
- [ ] 界面美化
- [ ] 代码优化