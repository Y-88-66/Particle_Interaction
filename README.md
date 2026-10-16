# Particle Interaction

简洁说明书 — 在此仓库中实现一个可交互的粒子系统（鼠标/触控吸引/排斥粒子）。

语言与工具
- 语言：TypeScript、React (TSX)
- 渲染库：three.js、@react-three/fiber（React + three.js bindings）
- 开发工具：Node.js (>=16/18 推荐)、npm 或 yarn、Vite（开发服务器与打包）
- 编辑器：VS Code（推荐）

需要安装的软件
1. Node.js (LTS) — https://nodejs.org/
2. Git
3. VS Code（可选插件：ESLint、Prettier, TypeScript Hero）

安装依赖（在仓库根目录运行）
- npm install

开发 / 运行
- npm run dev         # 启动开发服务器
- npm run build       # 打包生产
- npm run preview     # 预览构建结果
- npm run typecheck   # 类型检查

项目结构说明（关键文件）
- index.html               # 页面入口
- package.json             # 脚本与依赖
- src/main.tsx             # React 挂载点
- src/App.tsx              # Canvas + UI
- src/components/ParticleScene.tsx  # 粒子交互实现（核心）
- src/constants.ts         # 参数常量
- src/styles.css           # 基本样式

实现��骤（简洁可执行）
1. 本地准备：安装 Node.js、克隆仓库、在仓库根运行 npm install。
2. 启动：npm run dev，访问控制台给出的本地地址（通常 http://localhost:5173）。
3. 源码重点：
   - ParticleScene.tsx 在组件挂载时生成 positions、velocities、colors 的 Float32Array。
   - 使用 BufferGeometry + BufferAttribute 将 position/color 传入 GPU 渲染。
   - 使用 window pointer 事件将屏幕指针映射到世界坐标（unproject），设置为 attractor。
   - 在 useFrame 每帧更新 velocities/positions，根据 attractor 的位置计算吸引/排斥力，写回 bufferAttribute 并设置 needsUpdate。
   - 通过 click 切换 attract/repulse（用户交互）。
4. 调试：若运行后无显示，检查浏览器控制台是否报错，确认依赖是否安装。
5. 性能提示：当前实现以 JS 更新位置，适合中低数量（几千）粒子；如需更高性能请将计算迁移到 shader（GPU）。

扩展建议（后续可做）
- 使用 ShaderMaterial 在顶点/片段着色器中做真实 GPU 运算（可实现更大规模粒子）。
- 加入 WebXR/手势识别（@react-three/xr）做 VR 手部交互。
- 添加音频响应（Audio Analyser）随音乐节拍改变粒子行为。

代码已直接提交到本仓库的 src/ 下，按上面步骤安装并运行即可看到效果。需要我把 GPU shader 版本或更复杂交互（例如多点吸引、触觉反馈）继续补充吗？
