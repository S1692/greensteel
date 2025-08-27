'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

const NotFoundPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width, H = canvas.height;
    const GROUND_Y = Math.floor(H * 0.8);
    const GRAVITY = 0.8, JUMP_VELOCITY = -13.5;

    let BASE_SPEED = 6.0;
    let speed = BASE_SPEED;

    let score = 0, highScore = Number(localStorage.getItem('trexCloneHighScore') || '0');
    let running = true;
    let frame = 0;
    let startTime = Date.now();

    // ==== Time-seeded PRNG ====
    const startMs = performance.now();
    const tzBiasMin = new Date().getTimezoneOffset();
    let prngState = (Math.imul(1664525, (Date.now() ^ Math.floor(startMs) ^ (tzBiasMin<<16)) >>> 0) + 1013904223) >>> 0;
    function rand(){
      prngState ^= prngState << 13; prngState |= 0;
      prngState ^= prngState >>> 17;
      prngState ^= prngState << 5; prngState |= 0;
      return (prngState >>> 0) / 4294967296;
    }
    function rng(min: number, max: number){ return min + (max-min) * rand(); }

    const dino = { x: 100, y: GROUND_Y, w: 36, h: 46, vy: 0, ducking: false, onGround(){return this.y >= GROUND_Y - this.h;} };
    const obstacles: any[] = [];

    function jump(){ if(dino.onGround()) dino.vy = JUMP_VELOCITY; }

    const handleKeyDown = (e: KeyboardEvent) => {
      if(e.code === 'Space' || e.code === 'ArrowUp'){ if(running) jump(); else restart(); }
      if(e.code === 'KeyR'){ restart(); }
    };

    let spawnCooldown = 40;

    function update(){
      if(!running) return;
      frame++;

      // Progressive speed increase
      const elapsedSec = (Date.now() - startTime)/1000;
      const hour = new Date().getHours();
      const diurnal = 0.12 * Math.sin((hour/24)*Math.PI*2 + frame*0.005);
      speed = BASE_SPEED + 0.07*elapsedSec + 0.25*Math.log1p(elapsedSec) + diurnal;
      if(speed > 16) speed = 16;

      dino.vy += GRAVITY;
      dino.y += dino.vy;
      if(dino.y > GROUND_Y - dino.h){ dino.y = GROUND_Y - dino.h; dino.vy = 0; }

      // Spawn obstacles using seeded randomness + difficulty scaling
      if(--spawnCooldown <= 0){
        const difficulty = Math.min(1 + elapsedSec/45, 4);
        const bigProb = Math.min(0.25 + elapsedSec/180, 0.6);
        const big = rand() < bigProb;
        const h = Math.round(big ? rng(50, 72) : rng(28, 48));
        const w = Math.round(big ? rng(26, 40) : rng(14, 26));
        obstacles.push({x: W + rng(10,60), w, h});
        const jitter = 1 + 0.2*Math.sin((frame + startMs/8.3)*0.05);
        const baseGap = rng(40,120) * jitter;
        spawnCooldown = Math.max(14, Math.floor(baseGap / difficulty));
      }

      for(const o of obstacles) o.x -= speed;
      while(obstacles.length && obstacles[0].x + obstacles[0].w < -5) obstacles.shift();

      score += speed * 0.05;

      const dBox = {x:dino.x,y:dino.y,w:dino.w,h:dino.h};
      for(const o of obstacles){
        const oBox = {x:o.x,y:GROUND_Y-o.h,w:o.w,h:o.h};
        if(aabb(dBox,oBox)){
          running = false;
          const s = Math.floor(score);
          if(s > highScore){ highScore = s; localStorage.setItem('trexCloneHighScore', String(highScore)); }
        } 
      }
    }

    function aabb(a: any, b: any){ return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }

    function draw(){
      if (!ctx) return;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--fg');
      ctx.fillRect(0,GROUND_Y,W,2);

      ctx.fillRect(dino.x,dino.y,dino.w,dino.h);
      for(const o of obstacles){ ctx.fillRect(o.x,GROUND_Y-o.h,o.w,o.h); }

      ctx.font = '16px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`HI ${highScore}  ${Math.floor(score)}`, W-10, 20);

      // 현재 시간 + 플레이 시간 표시
      const elapsedSec = (Date.now()-startTime)/1000;
      const now = new Date();
      const hh = String(now.getHours()).padStart(2,'0');
      const mm = String(now.getMinutes()).padStart(2,'0');
      const ss = String(now.getSeconds()).padStart(2,'0');
      ctx.font = '12px monospace';
      ctx.fillText(`${hh}:${mm}:${ss} | ${elapsedSec.toFixed(1)}s`, W-10, 36);

      if(!running){
        ctx.textAlign='center'; ctx.fillText('GAME OVER – R to restart',W/2,H/2);
      }
    }

    function restart(){ running = true; score=0; startTime=Date.now(); speed=BASE_SPEED; frame=0; obstacles.length=0; dino.y=GROUND_Y-dino.h; dino.vy=0; }

    function loop(){ update(); draw(); requestAnimationFrame(loop); }
    dino.y=GROUND_Y-dino.h;
    loop();

    // Event listeners
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - 페이지를 찾을 수 없습니다</h1>
          <p className="text-lg text-gray-600 mb-2">
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
          </p>
          <p className="text-sm text-gray-500">
            아래 게임을 즐기시거나 홈으로 돌아가세요!
          </p>
        </div>

        {/* T-Rex Runner Game */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              T-Rex Runner – Randomized Obstacles & Progressive Speed
            </h2>
            <div className="text-sm text-gray-600">
              점프: <kbd className="bg-gray-100 border border-gray-300 px-2 py-1 rounded">Space</kbd>/<kbd className="bg-gray-100 border border-gray-300 px-2 py-1 rounded">↑</kbd> · 
              재시작: <kbd className="bg-gray-100 border border-gray-300 px-2 py-1 rounded">R</kbd>
            </div>
          </div>
          
          <canvas 
            ref={canvasRef}
            width="900" 
            height="260" 
            className="w-full h-auto border border-gray-300 rounded-lg bg-white mx-auto block"
            style={{ maxWidth: '100%' }}
            aria-label="T-Rex Runner Clone"
          />
          
          <div className="text-center mt-4 text-sm text-gray-500">
            이 코드는 크롬의 오리지널 공룡게임 소스가 아니라, 유사한 플레이를 가진 <b>독자 구현</b>입니다.
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center space-y-4">
          <Link 
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            홈으로 돌아가기
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>greensteel.site에서 404 오류가 발생했습니다.</p>
            <p>잠시 게임을 즐기시거나 위의 버튼을 클릭하여 홈으로 이동하세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
