import { useState } from 'react'
import { VestingSimulator } from './VestingSimulator'
import { ValidatorFlow } from './ValidatorFlow'

type MainTab = 'vesting' | 'validator'

export default function App() {
  const [tab, setTab] = useState<MainTab>('vesting')

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-xs font-bold tracking-tight text-white"
              aria-hidden
            >
              OP
            </span>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-semibold text-zinc-900">
                Onchain treasury &amp; governance
              </p>
              <p className="text-xs text-zinc-500">Internal explainer</p>
            </div>
          </div>

          <nav
            className="flex flex-1 justify-center gap-1 sm:gap-2"
            aria-label="Main sections"
          >
            <button
              type="button"
              onClick={() => setTab('vesting')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === 'vesting'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              Treasury vesting
            </button>
            <button
              type="button"
              onClick={() => setTab('validator')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === 'validator'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              Proposal Validator
            </button>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-zinc-900 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 sm:hidden"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="hidden rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 sm:inline-block"
            >
              Reset page
            </button>
          </div>
        </div>
      </header>

      <main>
        {tab === 'vesting' && (
          <div>
            <section className="relative overflow-hidden border-b border-zinc-200 bg-white">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-[0.35]"
                style={{ backgroundImage: 'url(/hero-texture.png)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/90 to-white" />
              <div className="relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Treasury vesting
                </p>
                <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl md:leading-[1.1]">
                  Model how OP moves from the Foundation to the DAO and
                  from the DAO to OP Labs.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600">
                  We&apos;re moving the funding of Labs onchain, giving the DAO
                  direct control over Labs funding and minimizing Foundation
                  discretion.
                </p>
              </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
                  Try the assumptions
                </h2>
                <p className="mt-3 text-zinc-600">
                  Each step pairs the live snapshot with the controls that move
                  those numbers, so you always see the impact next to what you
                  change.
                </p>
              </div>
              <div className="mt-14">
                <VestingSimulator />
              </div>

              <div className="mx-auto mt-20 max-w-3xl rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
                <p className="text-sm leading-relaxed text-zinc-600">
                  <strong className="text-zinc-900">Op Labs stakeholders:</strong>{' '}
                  the LAD flow is DAO-governed from the Timelock; streamed
                  entitlement in this demo is days × rate. Foundation → DAO
                  vesting (FDC + Governance Claimer) is the one-way commitment
                  lane, with a rate floor that only ratchets up when you use the
                  boost controls.
                </p>
              </div>
            </section>
          </div>
        )}

        {tab === 'validator' && (
          <div>
            <section className="border-b border-zinc-200 bg-white">
              <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Proposal Validator
                </p>
                <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl md:leading-[1.1]">
                  Walk through submission, approval gates, and Governor votes.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600">
                  This sandbox is a{' '}
                  <strong className="font-medium text-zinc-800">dummy app</strong>
                  : pick a real proposal class from the roadmap, satisfy the
                  same count of attestations the validator would expect, then
                  simulate token voting or an optimistic veto.
                </p>

                <div className="mt-10 rounded-3xl border border-zinc-200 bg-zinc-50/80 p-6 md:p-8">
                  <p className="text-sm font-semibold text-zinc-900">
                    How the routing layer thinks
                  </p>
                  <ol className="mt-4 grid gap-4 md:grid-cols-5">
                    {[
                      {
                        n: '01',
                        t: 'Submit',
                        d: 'Typed proposal hits the validator first.',
                      },
                      {
                        n: '02',
                        t: 'Rule checks',
                        d: 'Voting cycles, calldata shape, role classes.',
                      },
                      {
                        n: '03',
                        t: 'EAS signals',
                        d: 'Delegates, DAB, citizens attest off-chain state.',
                      },
                      {
                        n: '04',
                        t: 'Queue',
                        d: 'Hold until every gate for that class is true.',
                      },
                      {
                        n: '05',
                        t: 'Governor',
                        d: 'Forward to the correct voting module.',
                      },
                    ].map((row) => (
                      <li
                        key={row.n}
                        className="rounded-2xl border border-zinc-200/80 bg-white p-4 text-left shadow-sm"
                      >
                        <span className="text-2xl font-semibold text-zinc-300">
                          {row.n}
                        </span>
                        <p className="mt-2 text-sm font-semibold text-zinc-900">
                          {row.t}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                          {row.d}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
              <ValidatorFlow />
            </section>
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
            <div>
              <p className="text-sm font-semibold text-zinc-900">OP</p>
              <p className="mt-2 max-w-md text-xs text-zinc-500">
                Educational mockups derived from ScopeLift specs in this folder.
                Not an official Optimism product surface.
              </p>
            </div>
            <p className="text-xs text-zinc-400">
              Proposal Validator · Treasury vesting · 2026 internal demo
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
