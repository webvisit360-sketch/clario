import Image from 'next/image';
import { SiteNavbar } from './site-navbar';

const HERO_IMAGE =
  'https://images-porsche.imgix.net/-/media/CF0AC41384E449F5B3C1D657D4526AAF_8322698AE0CA4B1DB5D06D59C913678B_CZ25W12OD0007-911-carrera-gts-driving?w=1759&q=85&auto=format';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteNavbar />

      <div className="flex-1 flex">
        {/* Left — hero image (hidden on mobile) */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <Image
            src={HERO_IMAGE}
            alt="Porsche 911 v vožnji"
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(4,14,22,0.8) 0%, rgba(4,14,22,0.4) 50%, rgba(4,14,22,0.2) 100%)',
            }}
          />
          <div className="absolute bottom-12 left-10 right-10 z-10">
            <h2
              className="text-3xl font-extrabold text-white leading-tight mb-3"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              En iskalni vnos.
              <br />
              <span style={{ color: 'var(--brand-orange, #f25136)' }}>Vse cene. Vsi zalogi.</span>
            </h2>
            <p className="text-white/60 text-sm max-w-sm">
              Primerjalnik B2B cen rezervnih delov pri vseh vaših dobaviteljih hkrati.
            </p>
          </div>
        </div>

        {/* Right — form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
