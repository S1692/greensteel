'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  const router = useRouter();

  const handleEnter = () => {
    router.push('/dashboard');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen stitch-bg flex items-center justify-center px-4">
      <div className="stitch-card w-full max-w-md p-8">
        <h1 className="stitch-h1 text-3xl font-semibold text-center">
          GreenSteel
        </h1>
        <p
          className="text-center text-[13px] mt-1"
          style={{ color: 'var(--text-muted)' }}
        >
          ESG Management Platform
        </p>

        <div className="space-y-4 mt-8">
          <Button onClick={handleEnter} className="w-full">
            들어가기
          </Button>

          <Button onClick={handleRegister} variant="outline" className="w-full">
            회원가입
          </Button>
        </div>

        <p
          className="text-center mt-6 text-[13px]"
          style={{ color: 'var(--text-muted)' }}
        >
          GreenSteel은 LCA, CBAM, ESG 관리의 모든 것을 제공합니다
        </p>
      </div>
    </div>
  );
}
