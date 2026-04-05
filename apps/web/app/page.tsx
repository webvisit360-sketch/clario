import Image from 'next/image';
import Link from 'next/link';

const HERO_IMAGE =
  'https://images-porsche.imgix.net/-/media/CF0AC41384E449F5B3C1D657D4526AAF_8322698AE0CA4B1DB5D06D59C913678B_CZ25W12OD0007-911-carrera-gts-driving?w=1759&q=85&auto=format';

const stats = [
  { value: '8+', label: 'Dobaviteljev' },
  { value: '1', label: 'vpis' },
  { value: '18%', prefix: '\u2205 ', label: 'prihranek' },
  { value: '3s', prefix: '< ', label: 'rezultati' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* ─── Hero Section ─── */}
      <div className="relative min-h-[560px] overflow-hidden flex flex-col">
        {/* Background image */}
        <Image
          src={HERO_IMAGE}
          alt="Porsche 911 v vožnji"
          fill
          className="object-cover"
          priority
        />

        {/* Dark gradient overlay — left dark, right transparent */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(8,12,20,0.88) 0%, rgba(8,12,20,0.65) 50%, rgba(8,12,20,0.2) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-success/30 bg-brand-success/10 px-3.5 py-1.5 mb-8">
              <span className="h-2 w-2 rounded-full bg-brand-success animate-pulse" />
              <span className="text-sm text-brand-success font-medium">
                Nova platforma za avtoservise &middot; SLO
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-[3.25rem] sm:text-[3.5rem] font-extrabold leading-[1.08] tracking-tight mb-6"
              style={{ fontFamily: 'var(--font-syne), sans-serif' }}
            >
              En iskalni vnos.
              <br />
              <span className="text-primary">Vse cene.</span>
              <br />
              Vsi zalogi.
            </h1>

            {/* Subtitle */}
            <p
              className="text-base text-white/70 max-w-md mb-8 leading-relaxed"
              style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
            >
              Primerjalnik B2B cen rezervnih delov pri vseh vaših dobaviteljih
              hkrati. Prihranite čas in denar pri vsakem naročilu.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Začni brezplačno
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-white/5 px-6 py-3 text-sm font-medium text-foreground hover:bg-white/10 transition-colors"
              >
                Prijava
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar — bottom of hero */}
        <div className="relative z-10 w-full border-t border-border/50 bg-[rgba(8,12,20,0.8)] backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <p className="text-2xl font-bold text-foreground">
                    {stat.prefix}
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
