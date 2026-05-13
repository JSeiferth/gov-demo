import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from 'react'

function formatOp(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

type Insight = { label: string; detail: string }

const snapshotShell = 'rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6'

function SnapshotHeader({
  simElapsedDays,
  paused,
  setPaused,
  daysPerRealSecond,
  setDaysPerRealSecond,
}: {
  simElapsedDays: number
  paused: boolean
  setPaused: Dispatch<SetStateAction<boolean>>
  daysPerRealSecond: number
  setDaysPerRealSecond: (n: number) => void
}) {
  return (
    <div className={snapshotShell}>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Live snapshot
      </p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">
        Simulate funding flows
      </h2>
      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
        Numbers tick as time runs. Technical names for each step are in the
        grey notes—those match the implementation specification.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-zinc-50 px-3 py-2">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800"
        >
          {paused ? 'Resume' : 'Pause'} time
        </button>
        <label className="flex items-center gap-2 text-[11px] text-zinc-600">
          Speed
          <input
            type="range"
            min={0.05}
            max={3}
            step={0.05}
            value={daysPerRealSecond}
            onChange={(e) => setDaysPerRealSecond(Number(e.target.value))}
            className="w-20 accent-zinc-900"
          />
        </label>
      </div>
      <p className="mt-3 text-sm tabular-nums text-zinc-700">
        Model timeline:{' '}
        <span className="font-semibold text-zinc-900">
          {simElapsedDays.toLocaleString(undefined, {
            maximumFractionDigits: 1,
          })}{' '}
          days
        </span>
      </p>
    </div>
  )
}

function StockFoundation({ fndTreasuryBalance }: { fndTreasuryBalance: number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/90 p-4">
      <p className="text-sm font-semibold text-zinc-900">With the Foundation</p>
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-zinc-900">
        {formatOp(fndTreasuryBalance)}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        OP still in the commitment vault before it is sent to the DAO.
      </p>
      <p className="mt-2 border-t border-zinc-200/80 pt-2 text-[11px] leading-relaxed text-zinc-400">
        Spec: balance shown is OP held under the{' '}
        <span className="text-zinc-600">Foundation DAO Commitment (FDC)</span>{' '}
        prior to <span className="text-zinc-600">claim</span> transfers to the
        Timelock.
      </p>
    </div>
  )
}

function FlowFdcToDao({
  fdcRatePerDay,
  fdcUnclaimed,
}: {
  fdcRatePerDay: number
  fdcUnclaimed: number
}) {
  return (
    <div className="flex flex-col items-center py-2 text-center">
      <span className="text-xl leading-none text-zinc-300">↓</span>
      <p className="mt-1 text-xs font-semibold text-zinc-800">
        Stream into the collective
      </p>
      <p className="text-[11px] text-zinc-500">
        {formatOp(fdcRatePerDay)} OP / day ·{' '}
        <span className="font-mono text-zinc-700">{formatOp(fdcUnclaimed)}</span>{' '}
        built up, not yet moved
      </p>
      <p className="mt-1 text-[11px] text-zinc-400">
        FDC vesting +{' '}
        <span className="text-zinc-500">Governance Claimer</span> batching
      </p>
    </div>
  )
}

function StockDao({ daoTreasuryBalance }: { daoTreasuryBalance: number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-zinc-900">DAO treasury</p>
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-zinc-900">
        {formatOp(daoTreasuryBalance)}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        Tokens the DAO holds (illustrative Timelock balance).
      </p>
      <p className="mt-2 border-t border-zinc-200/80 pt-2 text-[11px] leading-relaxed text-zinc-400">
        Spec: proceeds from FDC claims land in the DAO treasury / Timelock; LAD
        uses <span className="text-zinc-600">transferFrom</span> against that
        balance.
      </p>
    </div>
  )
}

function FlowLad({
  ladRatePerDay,
  totalLadAccruedFromStream,
  ladAccruedUnclaimed,
}: {
  ladRatePerDay: number
  totalLadAccruedFromStream: number
  ladAccruedUnclaimed: number
}) {
  return (
    <div className="flex flex-col items-center py-2 text-center">
      <span className="text-xl leading-none text-zinc-300">↓</span>
      <p className="mt-1 text-xs font-semibold text-zinc-800">Stream to Op Labs</p>
      <p className="text-[11px] text-zinc-500">
        {formatOp(ladRatePerDay)} OP / day · accrued{' '}
        <span className="font-mono text-zinc-700">
          {formatOp(totalLadAccruedFromStream)}
        </span>
        , unpaid{' '}
        <span className="font-mono text-zinc-700">
          {formatOp(ladAccruedUnclaimed)}
        </span>
      </p>
      <p className="mt-1 text-[11px] text-zinc-400">
        <span className="text-zinc-500">Labs Allowance Distributor (LAD)</span>
        — entitlement grows with model time × rate (see spec for{' '}
        <span className="text-zinc-500">streamTokensPerSecond</span>).
      </p>
    </div>
  )
}

function StockLabs({
  labsClaimed,
  maxLabsClaimNow,
}: {
  labsClaimed: number
  maxLabsClaimNow: number
}) {
  return (
    <div className="rounded-2xl border border-op/25 bg-red-50/50 p-4 ring-1 ring-op/15">
      <p className="text-sm font-semibold text-zinc-900">With Op Labs</p>
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-zinc-900">
        {formatOp(labsClaimed)}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        Total tokens already received (cumulative).
      </p>
      <p className="mt-2 text-xs font-medium text-zinc-700">
        Ready to pay next:{' '}
        <span className="font-mono tabular-nums text-op">
          {formatOp(maxLabsClaimNow)}
        </span>{' '}
        OP
      </p>
      <p className="mt-2 border-t border-zinc-200/80 pt-2 text-[11px] leading-relaxed text-zinc-400">
        Spec: capped by accrued LAD entitlement and Timelock balance on chain;
        this preview does not model a separate ERC-20{' '}
        <span className="text-zinc-500">approve</span> limit.
      </p>
    </div>
  )
}

/** One paired row: left = snapshot slice, right = settings. Aligns vertically on lg. */
function PairedRow({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start lg:gap-10">
      <div className="min-w-0 space-y-4">{left}</div>
      <div className="min-w-0">{right}</div>
    </div>
  )
}

export function VestingSimulator() {
  const [fdcPrincipal, setFdcPrincipal] = useState(50_000_000)
  const [fdcRatePerDay, setFdcRatePerDay] = useState(120_000)
  const [fdcRateFloor, setFdcRateFloor] = useState(120_000)
  const [daoClaimBatch, setDaoClaimBatch] = useState(500_000)
  const [fdcClaimedToDao, setFdcClaimedToDao] = useState(0)

  const [initialTreasury, setInitialTreasury] = useState(2_000_000)
  const [ladRatePerDay, setLadRatePerDay] = useState(35_000)
  const [labsClaimed, setLabsClaimed] = useState(0)
  const [ladTransferredFromTreasury, setLadTransferredFromTreasury] =
    useState(0)

  const [simElapsedDays, setSimElapsedDays] = useState(0)
  const [paused, setPaused] = useState(false)
  const [daysPerRealSecond, setDaysPerRealSecond] = useState(0.35)

  const lastFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (paused) {
      lastFrameRef.current = null
      return
    }
    let raf = 0
    const loop = (t: number) => {
      if (lastFrameRef.current == null) lastFrameRef.current = t
      const deltaMs = t - lastFrameRef.current
      lastFrameRef.current = t
      const deltaDays = (deltaMs / 1000) * daysPerRealSecond
      setSimElapsedDays((d) => d + deltaDays)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lastFrameRef.current = null
    }
  }, [paused, daysPerRealSecond])

  const totalFdcStreamed = useMemo(
    () => Math.min(fdcRatePerDay * simElapsedDays, fdcPrincipal),
    [fdcRatePerDay, simElapsedDays, fdcPrincipal],
  )
  const fdcUnclaimed = Math.max(0, totalFdcStreamed - fdcClaimedToDao)

  const fndTreasuryBalance = useMemo(
    () => Math.max(0, fdcPrincipal - fdcClaimedToDao),
    [fdcPrincipal, fdcClaimedToDao],
  )

  const daoTreasuryBalance = useMemo(() => {
    const b =
      initialTreasury + fdcClaimedToDao - ladTransferredFromTreasury
    return Math.max(0, b)
  }, [initialTreasury, fdcClaimedToDao, ladTransferredFromTreasury])

  const totalLadAccruedFromStream = ladRatePerDay * simElapsedDays
  const ladAccruedUnclaimed = Math.max(
    0,
    totalLadAccruedFromStream - ladTransferredFromTreasury,
  )

  const maxLabsClaimNow = useMemo(
    () => Math.min(ladAccruedUnclaimed, daoTreasuryBalance),
    [ladAccruedUnclaimed, daoTreasuryBalance],
  )

  const claimFdcToDao = useCallback(() => {
    const chunk = Math.min(daoClaimBatch, fdcUnclaimed)
    if (chunk <= 0) return
    setFdcClaimedToDao((x) => x + chunk)
  }, [daoClaimBatch, fdcUnclaimed])

  const claimLabs = useCallback(() => {
    const chunk = maxLabsClaimNow
    if (chunk <= 0) return
    setLabsClaimed((x) => x + chunk)
    setLadTransferredFromTreasury((x) => x + chunk)
  }, [maxLabsClaimNow])

  const resetMoney = useCallback(() => {
    setFdcClaimedToDao(0)
    setLabsClaimed(0)
    setLadTransferredFromTreasury(0)
    setFdcRateFloor(120_000)
    setFdcRatePerDay(120_000)
    setSimElapsedDays(0)
  }, [])

  const foundationBoostRate = (pct: number) => {
    setFdcRatePerDay((r) => {
      const next = Math.ceil(r * (1 + pct / 100))
      setFdcRateFloor((floor) => Math.max(floor, next))
      return next
    })
  }

  const insights: Insight[] = useMemo(() => {
    const list: Insight[] = []
    if (daoClaimBatch > fdcRatePerDay * 7) {
      list.push({
        label: 'Infrequent DAO transfers',
        detail:
          'Large Governance Claimer chunks mean fewer on-chain movements, but more stays in the FDC until each pull. Technical: FDC `claim` / `claimAll` vs `claimQuantity` on the Governance Claimer.',
      })
    }
    if (ladRatePerDay > fdcRatePerDay * 0.4) {
      list.push({
        label: 'Labs stream rivals Foundation stream',
        detail:
          'The LAD daily rate is high relative to Foundation→DAO vesting—watch whether the DAO treasury can support upcoming LAD transfers.',
      })
    }
    if (daoTreasuryBalance < Math.min(ladAccruedUnclaimed, 500_000)) {
      list.push({
        label: 'Treasury may block a Labs payment',
        detail:
          'Accrued LAD amounts can exceed what the Timelock actually holds; `transferFrom` would fail until the DAO funds the treasury (e.g. via FDC claims).',
      })
    }
    if (list.length === 0) {
      list.push({
        label: 'Balanced illustration',
        detail:
          'Two payment streams: irrevocable Foundation commitment to the DAO (FDC + Governance Claimer), and DAO-governed streaming to Labs (LAD).',
      })
    }
    return list.slice(0, 3)
  }, [
    daoClaimBatch,
    fdcRatePerDay,
    ladRatePerDay,
    ladAccruedUnclaimed,
    daoTreasuryBalance,
  ])

  const foundationPanel = (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
      <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
        Irrevocable amount from the Foundation
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
        The Foundation places OP into a commitment that pays out to the DAO over
        time. Those tokens are not taken back once committed.
      </p>
      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
        Contract: <strong className="font-medium text-zinc-700">FDC</strong>{' '}
        (<span className="italic">Foundation DAO Commitment</span>). Deposits are
        locked; streaming uses{' '}
        <span className="font-medium text-zinc-700">streamTokensPerSecond</span>{' '}
        and checkpointing described in the specification.
      </p>
      <div className="mt-6 space-y-5">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Total OP in the commitment
          </span>
          <input
            type="range"
            min={5_000_000}
            max={100_000_000}
            step={1_000_000}
            value={fdcPrincipal}
            onChange={(e) => setFdcPrincipal(Number(e.target.value))}
            className="mt-2 w-full accent-zinc-900"
          />
          <div className="mt-1 text-right font-mono text-sm text-zinc-900">
            {formatOp(fdcPrincipal)} OP
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            Spec: total OP funded into the FDC vault (illustrative cap on
            vesting).
          </p>
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            How fast it unlocks toward the DAO
          </span>
          <input
            type="range"
            min={fdcRateFloor}
            max={500_000}
            step={5_000}
            value={Math.max(fdcRatePerDay, fdcRateFloor)}
            onChange={(e) => setFdcRatePerDay(Number(e.target.value))}
            className="mt-2 w-full accent-zinc-900"
          />
          <div className="mt-1 flex flex-wrap justify-between gap-x-2 text-xs text-zinc-500">
            <span>
              Minimum committed pace:{' '}
              <span className="font-mono text-zinc-800">
                {formatOp(fdcRateFloor)}/d
              </span>
            </span>
            <span className="font-mono text-zinc-900">
              {formatOp(Math.max(fdcRatePerDay, fdcRateFloor))}/d
            </span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            Spec: the increase side cannot lower the rate below prior
            commitments; here, “Foundation speeds stream” raises that floor (see{' '}
            <span className="italic">streamIncreaseController</span> /{' '}
            <span className="italic">streamDecreaseController</span> in the spec).
          </p>
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => foundationBoostRate(10)}
            className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
          >
            Foundation increases pace +10%
          </button>
          <button
            type="button"
            onClick={() => foundationBoostRate(25)}
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            Foundation increases pace +25%
          </button>
        </div>
      </div>
    </section>
  )

  const governancePanel = (
    <section className="rounded-3xl border border-zinc-200 bg-zinc-50/90 p-6 md:p-8">
      <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
        Moving funds from the commitment into the DAO
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
        The DAO does not receive every token the instant it vests. It claims in
        fixed amounts—like an invoice run on a schedule you set.
      </p>
      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
        Contract:{' '}
        <strong className="font-medium text-zinc-700">Governance Claimer</strong>{' '}
        calls <span className="font-medium text-zinc-700">claim</span> on the
        FDC with parameter{' '}
        <code className="rounded bg-white px-1 text-zinc-800">claimQuantity</code>
        .
      </p>
      <label className="mt-5 block">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Size of each DAO transfer
        </span>
        <input
          type="range"
          min={50_000}
          max={3_000_000}
          step={50_000}
          value={daoClaimBatch}
          onChange={(e) => setDaoClaimBatch(Number(e.target.value))}
          className="mt-2 w-full accent-zinc-900"
        />
        <div className="mt-1 text-right font-mono text-sm text-zinc-900">
          {formatOp(daoClaimBatch)} OP
        </div>
      </label>
      <button
        type="button"
        onClick={claimFdcToDao}
        disabled={fdcUnclaimed <= 0}
        className="mt-4 w-full rounded-2xl bg-zinc-900 py-3 text-sm font-semibold text-white shadow-md hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Simulate one DAO claim
      </button>
    </section>
  )

  const labsPanel = (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
      <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
        Payments from the DAO to Op Labs
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
        Separately, the DAO can route a stream to Op Labs. The rate can be
        changed by governance. In this worksheet, what Labs are owed from the
        stream is simply time × rate, minus what has already been paid.
      </p>
      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
        Contract: <strong className="font-medium text-zinc-700">LAD</strong>{' '}
        (<span className="italic">Labs Allowance Distributor</span>),{' '}
        <span className="font-medium text-zinc-700">streamTokensPerSecond</span>,
        payouts via ERC-20{' '}
        <code className="rounded bg-zinc-100 px-1 text-zinc-800">
          transferFrom
        </code>{' '}
        from the Timelock <code className="text-zinc-700">TOKEN_SOURCE</code>.
      </p>
      <div className="mt-5 space-y-5">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Other OP already in the DAO treasury
          </span>
          <input
            type="range"
            min={0}
            max={25_000_000}
            step={500_000}
            value={initialTreasury}
            onChange={(e) => setInitialTreasury(Number(e.target.value))}
            className="mt-2 w-full accent-zinc-900"
          />
          <div className="mt-1 text-right font-mono text-sm text-zinc-900">
            {formatOp(initialTreasury)} OP
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            Illustrative opening Timelock balance excluding proceeds from FDC
            claims in this run.
          </p>
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Daily rate to Op Labs
          </span>
          <input
            type="range"
            min={0}
            max={200_000}
            step={1_000}
            value={ladRatePerDay}
            onChange={(e) => setLadRatePerDay(Number(e.target.value))}
            className="mt-2 w-full accent-zinc-900"
          />
          <div className="mt-1 text-right font-mono text-sm text-zinc-900">
            {formatOp(ladRatePerDay)}/d
          </div>
        </label>
        <button
          type="button"
          onClick={claimLabs}
          disabled={maxLabsClaimNow <= 0}
          className="w-full rounded-2xl border-2 border-op bg-white py-3 text-sm font-semibold text-zinc-900 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Simulate next Labs payment (max available)
        </button>
      </div>
    </section>
  )

  return (
    <div className="mx-auto max-w-6xl space-y-14">
      <PairedRow
        left={
          <>
            <SnapshotHeader
              simElapsedDays={simElapsedDays}
              paused={paused}
              setPaused={setPaused}
              daysPerRealSecond={daysPerRealSecond}
              setDaysPerRealSecond={setDaysPerRealSecond}
            />
            <div className={`${snapshotShell} space-y-0`}>
              <StockFoundation fndTreasuryBalance={fndTreasuryBalance} />
              <FlowFdcToDao
                fdcRatePerDay={fdcRatePerDay}
                fdcUnclaimed={fdcUnclaimed}
              />
            </div>
          </>
        }
        right={foundationPanel}
      />

      <PairedRow
        left={
          <div className={`${snapshotShell} space-y-0 pt-6`}>
            <p className="mb-4 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              Same snapshot · DAO leg
            </p>
            <StockDao daoTreasuryBalance={daoTreasuryBalance} />
          </div>
        }
        right={governancePanel}
      />

      <PairedRow
        left={
          <div className={`${snapshotShell} space-y-0 pt-6`}>
            <p className="mb-4 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              Same snapshot · Op Labs leg
            </p>
            <FlowLad
              ladRatePerDay={ladRatePerDay}
              totalLadAccruedFromStream={totalLadAccruedFromStream}
              ladAccruedUnclaimed={ladAccruedUnclaimed}
            />
            <StockLabs
              labsClaimed={labsClaimed}
              maxLabsClaimNow={maxLabsClaimNow}
            />
          </div>
        }
        right={labsPanel}
      />

      <div className="space-y-8">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <button
            type="button"
            onClick={resetMoney}
            className="text-sm font-semibold text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900"
          >
            Reset example (claims, floor, and clock)
          </button>
        </div>

        <div className="rounded-3xl border border-zinc-900 bg-zinc-900 p-6 text-white md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Quick checks
          </p>
          <ul className="mt-4 space-y-4">
            {insights.map((i) => (
              <li key={i.label}>
                <p className="font-semibold text-white">{i.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                  {i.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100">
          <img
            src="https://hackmd.io/_uploads/HJMESwOjbe.png"
            alt="Architecture diagram from vesting specification"
            className="w-full object-contain"
            loading="lazy"
          />
          <div className="border-t border-zinc-200 bg-white px-4 py-3 text-center">
            <a
              href="https://hackmd.io/_uploads/HJMESwOjbe.png"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline"
            >
              Open full diagram from spec
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
