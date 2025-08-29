'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

const NotFoundPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    // 정확한 타입 단언으로 ctx 고정 (TS 에러 해결)
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    // ====== Palette (Green + Steel) ======
    const COLORS = {
      bgTop: '#eef5f0',
      bgBottom: '#e5eef0',
      steel: '#8CA3AD',
      steelDark: '#5C7079',
      steelEdge: '#b9c7cd',
      neonGreen: '#25D366',
      neonGreenDark: '#1eaa53',
      text: '#0f172a',
    };

    const W = canvas.width;
    const H = canvas.height;
    const GROUND_Y = Math.floor(H * 0.82);

    // ====== Tuning ======
    const GRAVITY = 0.9;
    const JUMP_VY = -15.2;
    const BASE_SPEED = 6.1;
    const DUCK_SCALE = 0.62;
    const COYOTE_MS = 90;   // 착지 직후 점프 유예

    // ====== Game State ======
    let speed = BASE_SPEED;
    let score = 0;
    let highScore = Number(localStorage.getItem('greensteelRunnerHS') || '0');
    let running = true;
    let frame = 0;
    let startTime = Date.now();
    let spawnCooldown = 50;

    // 점프 보조 - 단순화
    let coyoteUntil = 0;
    let canJump = true;

    // RNG
    const startMs = performance.now();
    const tzBiasMin = new Date().getTimezoneOffset();
    let prng =
      (Math.imul(1664525, (Date.now() ^ Math.floor(startMs) ^ (tzBiasMin << 16)) >>> 0) + 1013904223) >>> 0;
    const rand = () => {
      prng ^= prng << 13; prng |= 0;
      prng ^= prng >>> 17;
      prng ^= prng << 5; prng |= 0;
      return (prng >>> 0) / 4294967296;
    };
    const rng = (a: number, b: number) => a + (b - a) * rand();

    // ====== Player (GreenSteel Mascot) ======
    const player = {
      x: 120,
      y: GROUND_Y,
      w: 42,
      h: 56,
      vy: 0,
      ducking: false,
      onGround() {
        const h = this.ducking ? this.h * DUCK_SCALE : this.h;
        return this.y >= GROUND_Y - h;
      },
      hitbox() {
        const hh = this.ducking ? this.h * DUCK_SCALE : this.h;
        return { x: this.x, y: GROUND_Y - hh, w: this.w, h: hh };
      },
    };

    type Obstacle = {
      type: 'pipe' | 'botdog' | 'drone';
      x: number; y: number; w: number; h: number;
      vy?: number; phase?: number;
    };
    const obstacles: Obstacle[] = [];

    // 캔버스에 포커스 → 스페이스/방향키 안정 수신
    canvas.focus();

    // ====== Controls ======
    function doJump() {
      // 단순화된 점프 로직
      if (canJump && (player.onGround() || performance.now() < coyoteUntil)) {
        player.vy = JUMP_VY;
        canJump = false;
        coyoteUntil = 0;
      }
    }
    
    function setDuck(on: boolean) { player.ducking = on; }
    
    function restart() {
      speed = BASE_SPEED;
      score = 0;
      obstacles.length = 0;
      frame = 0;
      startTime = Date.now();
      spawnCooldown = 42;
      player.y = GROUND_Y - player.h;
      player.vy = 0;
      player.ducking = false;
      running = true;
      coyoteUntil = 0;
      canJump = true;
    }

    // 키 매칭
    const isJumpKey = (e: KeyboardEvent) => {
      const k = e.key;
      return e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW'
        || k === ' ' || k === 'Spacebar' || k === 'ArrowUp' || k === 'Up' || k === 'w' || k === 'W';
    };
    const isDuckKey = (e: KeyboardEvent) => {
      const k = e.key;
      return e.code === 'ArrowDown' || e.code === 'KeyS'
        || k === 'ArrowDown' || k === 'Down' || k === 's' || k === 'S';
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (isJumpKey(e)) { e.preventDefault(); doJump(); return; }
      if (isDuckKey(e)) { e.preventDefault(); setDuck(true); return; }
      if (e.code === 'KeyR' || e.key === 'r' || e.key === 'R') { e.preventDefault(); restart(); }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (isDuckKey(e)) setDuck(false);
    };

    // 이벤트 리스너 등록 - 중복 제거
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // 캔버스 탭/클릭 = 점프
    const onCanvasTouchStart = (ev: TouchEvent) => { ev.preventDefault(); doJump(); };
    const onCanvasMouseDown  = (ev: MouseEvent)  => { ev.preventDefault(); doJump(); };
    canvas.addEventListener('touchstart', onCanvasTouchStart, { passive: false });
    canvas.addEventListener('mousedown',  onCanvasMouseDown);

    // 모바일 버튼 바인딩
    const bindHold = (id: string, press: () => void, release?: () => void) => {
      const el = document.getElementById(id);
      if (!el) return;

      const onTouchStart = (ev: TouchEvent) => { ev.preventDefault(); press(); };
      const onTouchEnd   = (ev: TouchEvent) => { ev.preventDefault(); release?.(); };
      const onMouseDown  = (ev: MouseEvent)  => { ev.preventDefault(); press(); };
      const onMouseUp    = (ev: MouseEvent)  => { ev.preventDefault(); release?.(); };
      const onMouseLeave = (ev: MouseEvent)  => { ev.preventDefault(); release?.(); };

      el.addEventListener('touchstart', onTouchStart, { passive: false });
      el.addEventListener('touchend',   onTouchEnd,   { passive: false });
      el.addEventListener('touchcancel',onTouchEnd,   { passive: false });
      el.addEventListener('mousedown',  onMouseDown);
      el.addEventListener('mouseup',    onMouseUp);
      el.addEventListener('mouseleave', onMouseLeave);

      return () => {
        el.removeEventListener('touchstart', onTouchStart);
        el.removeEventListener('touchend',   onTouchEnd);
        el.removeEventListener('touchcancel',onTouchEnd);
        el.removeEventListener('mousedown',  onMouseDown);
        el.removeEventListener('mouseup',    onMouseUp);
        el.removeEventListener('mouseleave', onMouseLeave);
      };
    };

    const unbindJump  = bindHold('btn-jump', () => doJump());
    const unbindDuck  = bindHold('btn-duck', () => setDuck(true), () => setDuck(false));
    const unbindReset = bindHold('btn-reset', () => restart());

    // ====== Utils ======
    const aabb = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) =>
      a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

    // ====== Update ======
    function update() {
      if (!running) return;
      frame++;

      // 속도 커브
      const t = (Date.now() - startTime) / 1000;
      const wobble = 0.08 * Math.sin(frame * 0.004);
      speed = BASE_SPEED + 0.065 * t + 0.22 * Math.log1p(t) + wobble;
      if (speed > 17.5) speed = 17.5;

      // === Physics ===
      const prevOnGround = player.onGround();

      player.vy += GRAVITY;
      player.y += player.vy;

      const targetH = player.ducking ? player.h * DUCK_SCALE : player.h;
      const targetY = GROUND_Y - targetH;

      if (player.y > targetY) {
        // 착지
        player.y = targetY;
        player.vy = 0;

        // 코요테 갱신 및 점프 가능 상태 복원
        coyoteUntil = performance.now() + COYOTE_MS;
        canJump = true;
      } else if (prevOnGround && !player.onGround()) {
        // 이륙: 코요테 유지
        coyoteUntil = performance.now() + COYOTE_MS;
      }

      // 스폰
      if (--spawnCooldown <= 0) {
        const difficulty = Math.min(1 + t / 50, 4);
        const r = rand();
        let type: Obstacle['type'] = 'pipe';
        if (r < 0.45) type = 'botdog';
        else if (r < 0.85) type = 'pipe';
        else type = 'drone';

        if (type === 'pipe') {
          const w = Math.round(rng(40, 56));
          const h = Math.round(rng(62, 118));
          obstacles.push({ type, x: W + rng(20, 80), w, h, y: GROUND_Y - h });
        } else if (type === 'botdog') {
          const w = Math.round(rng(36, 44));
          const h = Math.round(rng(30, 38));
          obstacles.push({ type, x: W + rng(20, 80), w, h, y: GROUND_Y - h });
        } else {
          const w = Math.round(rng(50, 70));
          const h = Math.round(rng(18, 26));
          const flyY = Math.round(GROUND_Y - rng(86, 126));
          obstacles.push({ type, x: W + rng(50, 130), w, h, y: flyY, vy: rng(0.25, 0.55), phase: rng(0, Math.PI * 2) });
        }

        const baseGap = rng(72, 150);
        spawnCooldown = Math.max(20, Math.floor(baseGap / difficulty));
        if (t < 7) spawnCooldown += 10;
      }

      // 이동
      for (const o of obstacles) {
        o.x -= speed;
        if (o.type === 'drone' && o.vy && o.phase !== undefined) {
          o.phase += 0.05;
          o.y += Math.sin(o.phase) * o.vy;
        }
      }
      while (obstacles.length && obstacles[0].x + obstacles[0].w < -12) obstacles.shift();

      // 점수
      score += speed * 0.05;

      // 충돌
      const pBox = player.hitbox();
      for (const o of obstacles) {
        const box = { x: o.x, y: o.y, w: o.w, h: o.h };
        if (aabb(pBox, box)) {
          running = false;
          const s = Math.floor(score);
          if (s > highScore) {
            highScore = s;
            localStorage.setItem('greensteelRunnerHS', String(highScore));
          }
        }
      }
    }

    // ====== Drawing ======
    function rounded(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
      const rr = Math.min(r, w / 2, h / 2);
      c.beginPath();
      c.moveTo(x + rr, y);
      c.arcTo(x + w, y, x + w, y + h, rr);
      c.arcTo(x + w, y + h, x, y + h, rr);
      c.arcTo(x, y + h, x, y, rr);
      c.arcTo(x, y, x + w, y, rr);
      c.closePath();
    }

    function drawBackground() {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, COLORS.bgTop);
      g.addColorStop(1, COLORS.bgBottom);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    function drawGround() {
      const beamH = 10;
      ctx.fillStyle = COLORS.steel;
      ctx.fillRect(0, GROUND_Y, W, beamH);
      ctx.fillStyle = COLORS.steelEdge;
      ctx.fillRect(0, GROUND_Y - 2, W, 2);
      ctx.fillStyle = COLORS.steelDark;
      for (let x = 10; x < W; x += 36) {
        ctx.beginPath();
        ctx.arc(x, GROUND_Y + beamH / 2, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawLogo() {
      ctx.save();
      ctx.font = 'bold 18px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';
      ctx.fillStyle = COLORS.steelDark;
      ctx.textAlign = 'left';
      ctx.fillText('GREEN', 12, 24);
      ctx.fillStyle = COLORS.neonGreenDark;
      ctx.fillText('STEEL', 64, 24);
      ctx.restore();
    }

    function drawPlayer() {
      const hb = player.hitbox();
      const cx = hb.x + hb.w / 2;
      const baseY = hb.y + hb.h;

      // stem
      const stemW = hb.w * 0.52;
      const stemH = hb.h * 0.6;
      const stemX = cx - stemW / 2; const stemY = baseY - stemH;
      const sGrad = ctx.createLinearGradient(stemX, stemY, stemX + stemW, stemY);
      sGrad.addColorStop(0, '#E6ECEF');
      sGrad.addColorStop(0.5, '#C9D4D9');
      sGrad.addColorStop(1, '#F0F4F6');
      ctx.fillStyle = sGrad;
      rounded(ctx, stemX, stemY, stemW, stemH, 7); ctx.fill();
      ctx.fillStyle = COLORS.steelDark;
      rounded(ctx, stemX - 2, stemY + stemH * 0.55, stemW + 4, 6, 3); ctx.fill();

      // cap
      const capW = hb.w * 1.22;
      const capH = hb.h * 0.68;
      const capX = cx - capW / 2;
      const capY = stemY - capH * 0.55;
      const capG = ctx.createLinearGradient(0, capY, 0, capY + capH);
      capG.addColorStop(0, '#2FE074');
      capG.addColorStop(1, '#1CB35A');
      ctx.fillStyle = capG;
      rounded(ctx, capX, capY, capW, capH, capH * 0.65); ctx.fill();

      // dots
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath(); ctx.arc(cx - capW * 0.26, capY + capH * 0.38, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + capW * 0.18, capY + capH * 0.25, 5, 0, Math.PI * 2); ctx.fill();

      // eyes
      ctx.fillStyle = '#1f2937';
      const eyeY = stemY + stemH * 0.35;
      ctx.beginPath(); ctx.arc(cx - 6, eyeY, 2.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 6, eyeY, 2.3, 0, Math.PI * 2); ctx.fill();

      // cheeks
      ctx.fillStyle = 'rgba(37, 211, 102, 0.5)';
      ctx.beginPath(); ctx.arc(cx - 12, eyeY + 6, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 12, eyeY + 6, 3.5, 0, Math.PI * 2); ctx.fill();
    }

    function drawObstacle(o: Obstacle) {
      if (o.type === 'pipe') {
        ctx.fillStyle = COLORS.steel;
        rounded(ctx, o.x, o.y, o.w, o.h, 5); ctx.fill();
        ctx.fillStyle = COLORS.steelEdge;
        rounded(ctx, o.x - 6, o.y - 12, o.w + 12, 12, 4); ctx.fill();
      } else if (o.type === 'botdog') {
        ctx.fillStyle = COLORS.steelDark;
        const bodyW = o.w, bodyH = o.h * 0.58;
        rounded(ctx, o.x, o.y + (o.h - bodyH), bodyW, bodyH, 4); ctx.fill();
        rounded(ctx, o.x - bodyW * 0.32, o.y + (o.h - bodyH) - bodyH * 0.12, bodyW * 0.48, bodyH * 0.52, 4); ctx.fill();
        ctx.fillStyle = COLORS.steel;
        ctx.fillRect(o.x + bodyW * 0.2, o.y + o.h - 6, 4, 6);
        ctx.fillRect(o.x + bodyW * 0.62, o.y + o.h - 6, 4, 6);
        ctx.fillStyle = COLORS.neonGreen;
        ctx.fillRect(o.x - bodyW * 0.18, o.y + (o.h - bodyH) + 3, 3, 3);
      } else {
        ctx.fillStyle = COLORS.steel;
        rounded(ctx, o.x, o.y, o.w, o.h, 6); ctx.fill();
        ctx.fillStyle = COLORS.steelDark;
        ctx.fillRect(o.x + o.w * 0.2, o.y + o.h * 0.35, o.w * 0.6, 4);
        ctx.fillRect(o.x - 6, o.y + o.h * 0.25, 6, o.h * 0.5);
        ctx.fillStyle = '#eaf6ff';
        ctx.fillRect(o.x + o.w * 0.66, o.y + 3, 9, 6);
        ctx.fillStyle = COLORS.neonGreen;
        ctx.fillRect(o.x + 6, o.y + o.h - 4, 3, 3);
      }
    }

    function drawHUD() {
      ctx.fillStyle = COLORS.text;
      ctx.font = '14px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`HI ${highScore}  ${Math.floor(score)}`, W - 10, 18);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const n = new Date();
      const hh = String(n.getHours()).padStart(2, '0');
      const mm = String(n.getMinutes()).padStart(2, '0');
      const ss = String(n.getSeconds()).padStart(2, '0');
      ctx.font = '12px ui-monospace, monospace';
      ctx.fillText(`${hh}:${mm}:${ss} | ${elapsed}s`, W - 10, 34);
    }

    function drawGameOver() {
      ctx.textAlign = 'center';
      ctx.font = '16px ui-monospace, monospace';
      ctx.fillStyle = COLORS.steelDark;
      ctx.fillText('GAME OVER – R to restart', W / 2, H / 2);
    }

    // ====== Render Loop ======
    function draw() {
      drawBackground();
      drawLogo();
      drawGround();
      drawPlayer();
      for (const o of obstacles) drawObstacle(o);
      drawHUD();
      if (!running) drawGameOver();
    }

    function loop() {
      update();
      draw();
      requestAnimationFrame(loop);
    }

    // init
    player.y = GROUND_Y - player.h;
    loop();

    // cleanup
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('touchstart', onCanvasTouchStart);
      canvas.removeEventListener('mousedown', onCanvasMouseDown);
      if (unbindJump) unbindJump();
      if (unbindDuck) unbindDuck();
      if (unbindReset) unbindReset();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">404 - 페이지를 찾을 수 없습니다</h1>
          <p className="text-lg text-gray-600 mb-2">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
          <p className="text-sm text-gray-500">
            아래 <span className="font-semibold text-emerald-600">GREENSTEEL</span> 미니게임을 잠깐 즐겨보세요!
          </p>
        </div>

        {/* GreenSteel Runner */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4 border border-emerald-100">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">GREENSTEEL MINI RUNNER</h2>
            <div className="text-sm text-gray-600">
              점프: <kbd className="bg-gray-100 border border-gray-300 px-2 py-1 rounded">Space</kbd> /
              <kbd className="bg-gray-100 border border-gray-300 px-2 py-1 rounded">↑</kbd> /
              <kbd className="bg-gray-100 border border-gray-300 px-2 py-1 rounded">W</kbd> ·{' '}
              숙이기: <kbd className="bg-gray-100 border border-gray-300 px-2 py-1 rounded">↓</kbd> /
              <kbd className="bg-gray-100 border border-gray-300 px-2 py-1 rounded">S</kbd> ·{' '}
              재시작: <kbd className="bg-gray-100 border border-gray-300 px-2 py-1 rounded">R</kbd>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={900}
            height={280}
            tabIndex={0} /* 키 입력 안정화를 위해 포커스 가능 */
            className="w-full h-auto border border-gray-200 rounded-lg bg-white mx-auto block outline-none focus:ring-2 focus:ring-emerald-300"
            aria-label="GreenSteel Runner"
          />

          {/* Mobile Controls */}
          <div className="mt-4 flex items-center justify-center gap-3 sm:gap-4">
            <button id="btn-jump" className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 active:translate-y-0.5">
              점프
            </button>
            <button id="btn-duck" className="px-4 py-2 rounded-lg bg-gray-800 text-white font-semibold shadow hover:bg-gray-900 active:translate-y-0.5">
              숙이기
            </button>
            <button id="btn-reset" className="px-4 py-2 rounded-lg bg-slate-500 text-white font-semibold shadow hover:bg-slate-600 active:translate-y-0.5">
              리셋
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
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
