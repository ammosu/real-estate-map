// components/P5Background.js
import React, { useEffect, useRef } from 'react';

const P5Background = ({ className }) => {
  const containerRef = useRef(null);
  const sketchRef = useRef(null);

  useEffect(() => {
    // 確保只在客戶端運行
    if (typeof window === 'undefined') return;
    
    // 避免重複創建p5實例
    if (sketchRef.current) {
      sketchRef.current.remove();
    }
    
    // 動態導入p5，防止SSR錯誤
    import('p5').then(p5Module => {
      const p5 = p5Module.default;
      // 創建新的p5實例
      sketchRef.current = new p5(sketch, containerRef.current);
    });
    
    // 清理函數
    return () => {
      if (sketchRef.current) {
        sketchRef.current.remove();
      }
    };
  }, []);

  // p5.js 草圖定義
  const sketch = (p) => {
    let particles = [];
    let ripples = [];
    const particleCount = 150; // 進一步增加粒子數量
    let hueValue = 0; // 用於顏色循環
    let mouseForce = { x: 0, y: 0 }; // 滑鼠力場
    
    // 粒子類型
    const PARTICLE_TYPES = {
      CIRCLE: 0,
      SQUARE: 1,
      TRIANGLE: 2
    };

    p.setup = () => {
      // 創建與容器相同大小的畫布
      if (containerRef.current) {
        p.createCanvas(
          containerRef.current.offsetWidth,
          containerRef.current.offsetHeight
        );
      } else {
        p.createCanvas(window.innerWidth, window.innerHeight);
      }
      
      p.colorMode(p.HSB, 360, 100, 100, 100); // 使用HSB顏色模式
      
      // 初始化粒子
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: p.random(p.width),
          y: p.random(p.height),
          size: p.random(4, 10), // 進一步增加粒子大小
          baseSize: p.random(4, 10), // 進一步增加基礎大小
          speedX: p.random(-1.0, 1.0), // 增加速度
          speedY: p.random(-1.0, 1.0), // 增加速度
          hue: p.random(160, 260), // 擴大顏色範圍
          type: p.floor(p.random(3)), // 隨機形狀類型
          pulseSpeed: p.random(0.02, 0.05), // 脈動速度
          pulsePhase: p.random(p.TWO_PI) // 脈動相位
        });
      }
    };

    p.draw = () => {
      // 創建漸變背景，增加透明度使其更明顯
      let bgGradient = p.drawingContext.createLinearGradient(0, 0, 0, p.height);
      bgGradient.addColorStop(0, p.color(210, 60, 25, 25).toString()); // 增加透明度和飽和度
      bgGradient.addColorStop(1, p.color(240, 70, 35, 25).toString()); // 增加透明度和飽和度
      p.drawingContext.fillStyle = bgGradient;
      p.rect(0, 0, p.width, p.height);
      
      // 更新滑鼠力場
      if (p.mouseIsPressed) {
        ripples.push({
          x: p.mouseX,
          y: p.mouseY,
          size: 0,
          maxSize: p.random(100, 200),
          speed: p.random(2, 5),
          alpha: 100
        });
      }
      
      // 更新和繪製波紋
      for (let i = ripples.length - 1; i >= 0; i--) {
        let ripple = ripples[i];
        p.noFill();
        p.stroke(210, 80, 90, ripple.alpha);
        p.strokeWeight(2);
        p.circle(ripple.x, ripple.y, ripple.size);
        
        ripple.size += ripple.speed;
        ripple.alpha -= 1;
        
        if (ripple.size > ripple.maxSize || ripple.alpha <= 0) {
          ripples.splice(i, 1);
        }
      }
      
      // 更新滑鼠力場
      mouseForce = {
        x: p.mouseX,
        y: p.mouseY
      };
      
      // 更新色相值
      hueValue = (hueValue + 0.2) % 360;
      
      // 繪製和更新粒子
      for (let i = 0; i < particles.length; i++) {
        let particle = particles[i];
        
        // 脈動大小效果
        let pulseFactor = p.sin(p.frameCount * particle.pulseSpeed + particle.pulsePhase);
        let currentSize = particle.baseSize + pulseFactor * 2;
        
        // 增強滑鼠互動效果
        if (p.mouseIsPressed && p.dist(p.mouseX, p.mouseY, particle.x, particle.y) < 150) { // 增加影響範圍
          // 滑鼠點擊時，粒子向外擴散，增強效果
          let angle = p.atan2(particle.y - p.mouseY, particle.x - p.mouseX);
          particle.speedX += p.cos(angle) * 0.4; // 增加力度
          particle.speedY += p.sin(angle) * 0.4; // 增加力度
          
          // 點擊時粒子顏色變化
          particle.hue = (particle.hue + 5) % 360;
        } else if (p.dist(mouseForce.x, mouseForce.y, particle.x, particle.y) < 200) { // 增加影響範圍
          // 滑鼠靠近時，粒子受到吸引，增強效果
          let angle = p.atan2(mouseForce.y - particle.y, mouseForce.x - particle.x);
          particle.speedX += p.cos(angle) * 0.1; // 增加力度
          particle.speedY += p.sin(angle) * 0.1; // 增加力度
        }
        
        // 限制最大速度
        let speed = p.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY);
        if (speed > 3) {
          particle.speedX = (particle.speedX / speed) * 3;
          particle.speedY = (particle.speedY / speed) * 3;
        }
        
        // 緩慢減速
        particle.speedX *= 0.99;
        particle.speedY *= 0.99;
        
        // 繪製不同形狀的粒子
        p.noStroke();
        // 使用HSB顏色模式，讓顏色隨時間變化，增加亮度和不透明度
        let particleHue = (particle.hue + hueValue * 0.1) % 360;
        p.fill(particleHue, 85, 95, 90); // 進一步增加飽和度和不透明度
        
        switch(particle.type) {
          case PARTICLE_TYPES.CIRCLE:
            p.ellipse(particle.x, particle.y, currentSize);
            break;
          case PARTICLE_TYPES.SQUARE:
            p.push();
            p.translate(particle.x, particle.y);
            p.rotate(p.frameCount * 0.01 + i);
            p.rectMode(p.CENTER);
            p.rect(0, 0, currentSize, currentSize);
            p.pop();
            break;
          case PARTICLE_TYPES.TRIANGLE:
            p.push();
            p.translate(particle.x, particle.y);
            p.rotate(p.frameCount * 0.02 + i);
            let r = currentSize / 2;
            p.triangle(0, -r, -r * 0.866, r * 0.5, r * 0.866, r * 0.5);
            p.pop();
            break;
        }
        
        // 更新位置
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // 包裹邊界
        if (particle.x < 0) particle.x = p.width;
        if (particle.x > p.width) particle.x = 0;
        if (particle.y < 0) particle.y = p.height;
        if (particle.y > p.height) particle.y = 0;
      }
      
      // 繪製連接線，增加可見度
      p.stroke(210, 70, 95, 45); // 進一步增加線條的亮度和不透明度
      p.strokeWeight(1.0); // 進一步增加線條粗細
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          let distance = p.dist(
            particles[i].x, particles[i].y,
            particles[j].x, particles[j].y
          );
          
          if (distance < 150) { // 進一步增加連接距離
            // 線條透明度隨距離變化
            let alpha = p.map(distance, 0, 150, 60, 0); // 進一步增加最大透明度
            p.stroke(210, 60, 95, alpha);
            p.line(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
          }
        }
      }
    };

    // 響應窗口大小變化
    p.windowResized = () => {
      if (containerRef.current) {
        p.resizeCanvas(
          containerRef.current.offsetWidth,
          containerRef.current.offsetHeight
        );
      }
    };
    
    // 滑鼠移動事件
    p.mouseMoved = () => {
      mouseForce = {
        x: p.mouseX,
        y: p.mouseY
      };
    };
  };

  return <div ref={containerRef} className={className} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }} />;
};

export default P5Background;