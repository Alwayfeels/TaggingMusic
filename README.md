# TaggingMusic
为你喜欢的音乐标记 tag，快捷的根据 tag 生成个性歌单。灵感来自 flomo 

# 技术栈
## 前端
Vue3(setup-script) + Vite + Pinia + NaiveUI + TailwindCSS + Localforage + vicons
## 后台
[NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) + Vercel
# 线上地址
暂无

# 启动
推荐使用 pnpm，减少node_modules体积
```bash
pnpm install
pnpm run dev
```
# 计划
## milestone1 - 基本功能
- [x] 二维码登陆 
- [x] 歌单列表展示 
- [x] 歌曲列表展示 
	- [x] 分页
- [x] 设置标签 
- [x] indexedDB本地存储歌单 【完成】
- [x] 根据 tag 生成歌单
- [ ] 播放音乐
- [ ] 界面美化
- [ ] 代码优化