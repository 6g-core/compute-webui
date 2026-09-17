import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// 第一次打开网页即刻预加载并缓存眼镜和机器狗图像，杜绝切换阶段时的显示延迟
if (typeof window !== 'undefined') {
  ['/topology/glasses_transparent.png', '/topology/robotdog_transparent.png'].forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
