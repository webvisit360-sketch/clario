import Image from 'next/image';
import Link from 'next/link';
import { SavingsCalculator } from './_components/savings-calculator';

const tickerData = [
  { seller: 'Inter Cars', price: '24,80 €' },
  { seller: 'Autodoc', price: '27,40 €' },
  { seller: 'Elit', price: '28,90 €' },
  { seller: 'GMT', price: '26,10 €' },
  { seller: 'Euroton', price: '29,50 €' },
  { seller: 'AutoKelly', price: '31,20 €' },
  { seller: 'AvtoRoma', price: '25,60 €' },
];

const features = [
  { icon: '⚡', title: 'Takojšnja primerjava', desc: 'Ena kataloška številka — hkratni rezultati pri vseh vaših dobaviteljih v manj kot 3 sekundah.', highlight: true },
  { icon: '🔐', title: 'Vaše B2B cene', desc: 'Sistem se poveže z vašimi računi pri dobaviteljih. Vidite vaše pogajane cene z rabatom.' },
  { icon: '🛒', title: 'En klik v košarico', desc: 'Izberete najcenejšega dobavitelja in z enim klikom dodate artikel direktno v njihovo košarico.' },
  { icon: '📦', title: 'Zaloga v realnem času', desc: 'Zelena / rumena / rdeča pika — takoj vidite kje je del na zalogi in kdaj bo dostavljen.' },
  { icon: '📋', title: 'Zgodovina iskanj', desc: 'Vse pretekle iskanje shranjene. Ponovite naročilo z enim klikom brez ponovnega vnosa.' },
  { icon: '👥', title: 'Multi-user dostop', desc: 'Več mehanikov v isti delavnici — vsak ima svoj profil, skupna zgodovina naročil.' },
  { icon: '🔔', title: 'Cenovna opozorila', desc: 'Nastavite prag cene za pogosto naročene dele. Sistem vas obvesti ko cena pade.' },
  { icon: '📊', title: 'Analitika nakupov', desc: 'Mesečno poročilo — kje ste največ prihranili, kateri dobavitelj je bil najcenejši.' },
  { icon: '🌍', title: '7 jezikov', desc: 'SL, HR, DE, EN, IT, HU, SR — platforma prilagodite jeziku vaše delavnice.' },
];

const steps = [
  { num: 1, title: 'Vnesete kataloško', desc: 'OEM ali kataloška številka rezervnega dela' },
  { num: 2, title: 'Clario primerja', desc: 'Poizvedba pri vseh vaših dobaviteljih hkrati' },
  { num: 3, title: 'Vi izberete', desc: 'Cena, zaloga, dostava — odločite se in naročite' },
  { num: 4, title: 'V košarico', desc: 'En klik doda del direktno pri izbranem dobavitelju' },
];

function Check() {
  return <span className="text-emerald-600">&#10003;</span>;
}
function Cross() {
  return <span className="text-neutral-300">&#10007;</span>;
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border h-[52px] flex items-center px-6">
        <div className="flex items-center gap-2 mr-auto">
          <Link href="/" className="text-xl font-extrabold" style={{ fontFamily: 'var(--font-syne)' }}>
            clario<span className="text-muted-foreground">.si</span>
          </Link>
          <span
            className="text-muted-foreground uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px' }}
          >
            B2B Parts
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-foreground absolute left-1/2 -translate-x-1/2">
          <a href="#funkcionalnosti" className="hover:text-primary transition-colors">Funkcionalnosti</a>
          <a href="#cenik" className="hover:text-primary transition-colors">Cenik</a>
          <a href="#kako-deluje" className="hover:text-primary transition-colors">Prodajalci</a>
          <a href="#kalkulator" className="hover:text-primary transition-colors">O nas</a>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <Link
            href="/login"
            className="text-sm border border-border rounded-lg px-4 py-1.5 hover:bg-muted transition-colors"
          >
            Prijava
          </Link>
          <Link
            href="/register"
            className="text-sm bg-primary text-primary-foreground rounded-lg px-4 py-1.5 hover:opacity-90 transition-opacity"
          >
            Brezplačna registracija
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ minHeight: 560 }}>
        <Image
          src="https://images-porsche.imgix.net/-/media/CF0AC41384E449F5B3C1D657D4526AAF_8322698AE0CA4B1DB5D06D59C913678B_CZ25W12OD0007-911-carrera-gts-driving?w=1759&q=85&auto=format"
          alt="Porsche 911 v vožnji"
          fill
          className="object-cover"
          priority
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(8,12,20,0.85) 0%, rgba(8,12,20,0.65) 50%, rgba(8,12,20,0.2) 100%)',
          }}
        />

        <div className="relative z-10 flex flex-col justify-center px-6 sm:px-8 lg:px-12" style={{ minHeight: 560 }}>
          <div className="max-w-2xl pt-16 pb-24">
            <div className="inline-flex items-center gap-2 border border-white/15 rounded-full px-4 py-1.5 mb-8 text-sm text-white/70 bg-white/5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Nova platforma za avtoservise &middot; SLO
            </div>

            <h1
              className="text-[52px] md:text-[56px] font-extrabold leading-[1.08] mb-6"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              <span className="text-white">En iskalni vnos.</span>
              <br />
              <span className="text-primary">Vse cene.</span>
              <br />
              <span className="text-white">Vsi zalogi.</span>
            </h1>

            <p className="text-base text-white/70 max-w-md mb-10" style={{ fontFamily: 'var(--font-outfit)' }}>
              Primerjalnik B2B cen rezervnih delov pri vseh vaših
              dobaviteljih hkrati. Prihranite čas in denar pri vsakem naročilu.
            </p>

            <div className="flex items-center gap-4">
              <Link
                href="/register"
                className="bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold hover:opacity-90 transition-opacity"
              >
                Začni brezplačno
              </Link>
              <a
                href="#kako-deluje"
                className="border border-white/20 text-white rounded-lg px-6 py-3 font-semibold hover:bg-white/10 transition-colors"
              >
                Oglej si demo
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 backdrop-blur-sm" style={{ background: 'rgba(8,12,20,0.8)' }}>
          <div className="flex items-stretch justify-center divide-x divide-white/10">
            {[
              { value: '8+', label: 'Dobaviteljev' },
              { value: '1 vpis', label: 'Iskanje' },
              { value: '∅ 18%', label: 'Prihranek' },
              { value: '< 3s', label: 'Rezultati' },
            ].map((stat) => (
              <div key={stat.label} className="px-8 py-4 text-center">
                <p className="text-xl font-bold text-primary">{stat.value}</p>
                <p
                  className="text-[9px] uppercase tracking-wider text-white/50 mt-1"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE TICKER ── */}
      <section className="bg-neutral-50 border-y border-border py-3 overflow-hidden">
        <div
          className="inline-flex whitespace-nowrap"
          style={{ animation: 'ticker 20s linear infinite' }}
        >
          {[...tickerData, ...tickerData].map((item, i) => (
            <span
              key={i}
              className="mx-6 text-sm"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              <span className="text-foreground font-medium">{item.seller}</span>
              {' '}
              <span className="text-primary font-bold">{item.price}</span>
            </span>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="funkcionalnosti" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-3"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              Zakaj Clario
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Vse kar avtoservis potrebuje
            </h2>
            <p className="text-muted-foreground">En sistem. Vsi dobavitelji. Vaše B2B cene.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className={`rounded-lg border p-5 ${
                  f.highlight
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card'
                }`}
              >
                <span className="text-base">{f.icon}</span>
                <h3 className="text-sm font-semibold mt-3 mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="kako-deluje" className="py-24 px-6 bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-3"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              Kako deluje
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              3 koraki do najnižje cene
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
            {steps.map((step, i) => (
              <div key={step.num} className="text-center relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[calc(50%+24px)] w-[calc(100%-48px)] h-px bg-border" />
                )}
                <div
                  className="w-10 h-10 rounded-full border-2 border-primary text-primary flex items-center justify-center mx-auto mb-4 text-sm font-bold bg-background"
                  style={{ fontFamily: 'var(--font-syne)' }}
                >
                  {step.num}
                </div>
                <h3
                  className="text-sm font-semibold mb-1"
                  style={{ fontFamily: 'var(--font-syne)' }}
                >
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SAVINGS CALCULATOR ── */}
      <section id="kalkulator" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-3"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              Kalkulator prihrankov
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Koliko boste prihranili?
            </h2>
            <p className="text-muted-foreground">
              Vnesite vaše podatke in vidite ocenjeni letni prihranek
            </p>
          </div>

          <SavingsCalculator />
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="cenik" className="py-24 px-6 bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-3"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              Cenik
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Preprost. Transparenten.
            </h2>
            <p className="text-muted-foreground">Brez skritih stroškov. Odpoveste kadarkoli.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="border border-border rounded-xl p-6 bg-card flex flex-col">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-1">Starter</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold" style={{ fontFamily: 'var(--font-syne)' }}>29</span>
                <span className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-dm-mono)' }}>&euro;/mes</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">Za manjše delavnice do 2 uporabnika</p>
              <ul className="space-y-2 text-sm mb-8 flex-1">
                <li><Check /> 3 dobavitelji</li>
                <li><Check /> 200 iskanj/mes</li>
                <li><Check /> Zgodovina 30 dni</li>
                <li><Cross /> Analitika</li>
                <li><Cross /> Multi-user</li>
              </ul>
              <Link
                href="/register"
                className="block text-center border border-border rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                Začni brezplačno
              </Link>
            </div>

            {/* Pro */}
            <div className="border-2 border-primary rounded-xl p-6 bg-card flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider px-3 py-0.5 rounded-full whitespace-nowrap">
                Najbolj priljubljen
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-1">Pro</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold" style={{ fontFamily: 'var(--font-syne)' }}>79</span>
                <span className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-dm-mono)' }}>&euro;/mes</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">Za aktivne delavnice do 5 uporabnikov</p>
              <ul className="space-y-2 text-sm mb-8 flex-1">
                <li><Check /> Vsi dobavitelji (8+)</li>
                <li><Check /> Neomejeno iskanj</li>
                <li><Check /> Zgodovina 1 leto</li>
                <li><Check /> Analitika nakupov</li>
                <li><Check /> Cenovna opozorila</li>
              </ul>
              <Link
                href="/register"
                className="block text-center bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                Začni Pro
              </Link>
            </div>

            {/* Enterprise */}
            <div className="border border-border rounded-xl p-6 bg-card flex flex-col">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-1">Enterprise</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold" style={{ fontFamily: 'var(--font-syne)' }}>Po dogovoru</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">Za večje servise in verige delavnic</p>
              <ul className="space-y-2 text-sm mb-8 flex-1">
                <li><Check /> Neomejeni uporabniki</li>
                <li><Check /> API dostop</li>
                <li><Check /> Prilagojeni dobavitelji</li>
                <li><Check /> SLA podpora</li>
                <li><Check /> White-label opcija</li>
              </ul>
              <Link
                href="/register"
                className="block text-center border border-border rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                Kontaktirajte nas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border" style={{ fontFamily: 'var(--font-dm-mono)' }}>
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <Link href="/" className="font-bold text-foreground text-base" style={{ fontFamily: 'var(--font-syne)' }}>
            clario<span className="text-muted-foreground">.si</span>
          </Link>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <a href="#" className="hover:text-foreground transition-colors">Pogoji uporabe</a>
            <span>&middot;</span>
            <a href="#" className="hover:text-foreground transition-colors">Zasebnost</a>
            <span>&middot;</span>
            <a href="#" className="hover:text-foreground transition-colors">GDPR</a>
            <span>&middot;</span>
            <a href="#" className="hover:text-foreground transition-colors">Kontakt</a>
            <span>&middot;</span>
            <a href="#" className="hover:text-foreground transition-colors">Za dobavitelje</a>
          </div>
          <span className="text-xs">&copy; 2025 Pi4 d.o.o.</span>
        </div>
        <div className="border-t border-border py-3 text-center text-[10px] text-muted-foreground/60">
          &copy; 2025 Pi4 d.o.o. &middot; clario.si &middot; Vse pravice pridržane
        </div>
      </footer>
    </div>
  );
}
