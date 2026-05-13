import { useMemo, useState, useCallback } from 'react'
import {
  PROPOSAL_TYPES,
  CATEGORY_STYLES,
  type ProposalType,
} from './governanceData'

type Phase = 'select' | 'draft' | 'validator' | 'governor' | 'done'

function votePassed(
  mechanism: ProposalType['voteMechanism'],
  forVotes: number,
  againstVotes: number,
  vetoed: boolean,
): boolean {
  if (mechanism === 'optimistic') return !vetoed
  const total = forVotes + againstVotes
  if (total <= 0) return false
  const ratio = forVotes / total
  if (mechanism === 'supermajority76') return ratio >= 0.76
  if (mechanism === 'majority60') return ratio >= 0.6
  if (mechanism === 'approval') return true
  return false
}

export function ValidatorFlow() {
  const [phase, setPhase] = useState<Phase>('select')
  const [selected, setSelected] = useState<ProposalType | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [approvals, setApprovals] = useState(0)
  const [dabOk, setDabOk] = useState(false)
  const [approvalSignals, setApprovalSignals] = useState(0)
  const [forVotes, setForVotes] = useState(2_000_000)
  const [againstVotes, setAgainstVotes] = useState(450_000)
  const [vetoed, setVetoed] = useState(false)
  const [outcome, setOutcome] = useState<'passed' | 'failed' | null>(null)

  const resetForProposal = useCallback((p: ProposalType) => {
    setSelected(p)
    setTitle(p.name.length > 56 ? `${p.name.slice(0, 56)}…` : p.name)
    setDescription(p.purpose)
    setApprovals(0)
    setDabOk(false)
    setApprovalSignals(0)
    setForVotes(2_000_000)
    setAgainstVotes(450_000)
    setVetoed(false)
    setOutcome(null)
    setPhase('draft')
  }, [])

  const pickAnother = () => {
    setPhase('select')
    setSelected(null)
    setOutcome(null)
  }

  const submitToValidator = () => {
    if (!selected) return
    setPhase('validator')
    setApprovals(0)
    setDabOk(false)
    setApprovalSignals(0)
  }

  const validatorReady = useMemo(() => {
    if (!selected) return false
    if (selected.requiresDab && !dabOk) return false
    if (selected.requiredApprovals > 0 && approvals < selected.requiredApprovals)
      return false
    if (
      selected.voteMechanism === 'approval' &&
      approvalSignals < selected.approvalSignalsNeeded
    )
      return false
    return true
  }, [selected, dabOk, approvals, approvalSignals])

  const forwardToGovernor = () => {
    if (!validatorReady) return
    setPhase('governor')
  }

  const tallyGovernor = () => {
    if (!selected) return
    if (selected.voteMechanism === 'approval') {
      setOutcome('passed')
    } else {
      const pass = votePassed(
        selected.voteMechanism,
        forVotes,
        againstVotes,
        vetoed,
      )
      setOutcome(pass ? 'passed' : 'failed')
    }
    setPhase('done')
  }

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
      <div className="lg:col-span-5 space-y-6">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
          <h3 className="text-lg font-semibold text-zinc-900">
            Choose a proposal type
          </h3>
          <p className="mt-1 text-sm text-zinc-600">
            Each row loads the validator rules from the internal spec. Run the
            flow end-to-end as a teaching aid, not a real interface.
          </p>
          <div className="mt-4 max-h-[min(70vh,560px)] space-y-2 overflow-y-auto pr-1">
            {PROPOSAL_TYPES.map((p) => {
              const st = CATEGORY_STYLES[p.category]
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => resetForProposal(p)}
                  className={`w-full rounded-2xl border p-4 text-left transition hover:border-zinc-400 hover:bg-zinc-50 ${
                    selected?.id === p.id
                      ? 'border-zinc-900 bg-zinc-50 ring-2 ring-zinc-900/10'
                      : 'border-zinc-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-zinc-900">
                      {p.name}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${st.chip}`}
                    >
                      {p.category}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-zinc-500">
                    {p.purpose}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 space-y-6">
        {!selected && (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/50 p-12 text-center text-sm text-zinc-500">
            Select a proposal type to open the simulator workspace.
          </div>
        )}

        {selected && phase === 'draft' && (
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Draft (off-chain stand-in)
            </p>
            <input
              className="mt-4 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base font-medium text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Proposal title"
            />
            <textarea
              className="mt-3 min-h-[100px] w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 outline-none ring-zinc-900/10 focus:ring-4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description for reviewers"
            />
            <dl className="mt-6 grid gap-3 rounded-2xl bg-zinc-50 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Who can initiate</dt>
                <dd className="text-right text-zinc-900">{selected.initiator}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Entry requirements</dt>
                <dd className="text-right text-zinc-900">{selected.entry}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Token vote rule</dt>
                <dd className="text-right font-semibold text-zinc-900">
                  {selected.decision}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={submitToValidator}
              className="mt-6 w-full rounded-2xl bg-zinc-900 py-3.5 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Submit to Proposal Validator
            </button>
          </div>
        )}

        {selected && phase === 'validator' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Validator queue
              </p>
              <p className="mt-2 text-base font-semibold text-zinc-900">
                {title}
              </p>
              <ol className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-zinc-600">
                {[
                  'Submitted',
                  'Schema / cycle checks',
                  'Attestations',
                  'Ready to forward',
                ].map((s, i) => (
                  <li
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1"
                  >
                    <span className="text-zinc-400">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>

              <div className="mt-6 space-y-4">
                {selected.requiresDab && (
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4">
                    <p className="text-sm font-semibold text-zinc-900">
                      DAB attestation
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">
                      Core dev upgrade path requires Dev Advisory Board approval
                      before the Governor sees it.
                    </p>
                    <label className="mt-3 flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={dabOk}
                        onChange={(e) => setDabOk(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-300 accent-zinc-900"
                      />
                      <span className="text-sm text-zinc-800">
                        Simulate verified DAB attestation on-chain
                      </span>
                    </label>
                  </div>
                )}

                {selected.requiredApprovals > 0 && (
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">
                          Delegate approvals
                        </p>
                        <p className="mt-1 text-xs text-zinc-600">
                          EAS-backed approvers (
                          {selected.requiredApprovals} required for this type).
                        </p>
                      </div>
                      <span className="font-mono text-lg font-semibold text-zinc-900">
                        {approvals}/{selected.requiredApprovals}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setApprovals((a) =>
                            Math.min(a + 1, selected.requiredApprovals),
                          )
                        }
                        className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
                      >
                        +1 approval sig
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setApprovals(selected.requiredApprovals)
                        }
                        className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
                      >
                        Fill all required
                      </button>
                    </div>
                  </div>
                )}

                {selected.voteMechanism === 'approval' && (
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">
                          Candidate support signals
                        </p>
                        <p className="mt-1 text-xs text-zinc-600">
                          Election path needs multiple on-chain approvals per
                          candidate before tallying.
                        </p>
                      </div>
                      <span className="font-mono text-lg font-semibold text-zinc-900">
                        {approvalSignals}/{selected.approvalSignalsNeeded}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setApprovalSignals((x) =>
                            Math.min(
                              x + 1,
                              selected.approvalSignalsNeeded,
                            ),
                          )
                        }
                        className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
                      >
                        +1 signal
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setApprovalSignals(selected.approvalSignalsNeeded)
                        }
                        className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
                      >
                        Meet threshold
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={forwardToGovernor}
                  disabled={!validatorReady}
                  className="w-full rounded-2xl bg-zinc-900 py-3.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Forward to Optimism Governor
                </button>
                {!validatorReady && (
                  <p className="text-center text-xs text-zinc-500">
                    Complete attestations and approvals to unlock forwarding.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {selected && phase === 'governor' && (
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Optimism Governor (sandbox vote)
            </p>
            <p className="mt-2 text-base font-semibold text-zinc-900">
              {title}
            </p>

            {selected.voteMechanism === 'optimistic' && (
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <p className="text-sm font-semibold text-zinc-900">
                  Optimistic path
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  Proposal is queued for execution unless vetoed during the
                  review window.
                </p>
                <label className="mt-4 flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={vetoed}
                    onChange={(e) => setVetoed(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 accent-zinc-900"
                  />
                  <span className="text-sm text-zinc-800">
                    Simulate successful veto
                  </span>
                </label>
              </div>
            )}

            {(selected.voteMechanism === 'supermajority76' ||
              selected.voteMechanism === 'majority60') && (
              <div className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <p className="text-sm font-semibold text-zinc-900">
                  Token vote tally (mock weights)
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-zinc-500">Votes For</p>
                    <p className="font-mono text-xl text-zinc-900">
                      {forVotes.toLocaleString()}
                    </p>
                    <button
                      type="button"
                      onClick={() => setForVotes((v) => v + 250_000)}
                      className="mt-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-900 ring-1 ring-zinc-200"
                    >
                      +250k FOR
                    </button>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Votes Against</p>
                    <p className="font-mono text-xl text-zinc-900">
                      {againstVotes.toLocaleString()}
                    </p>
                    <button
                      type="button"
                      onClick={() => setAgainstVotes((v) => v + 250_000)}
                      className="mt-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-900 ring-1 ring-zinc-200"
                    >
                      +250k AGAINST
                    </button>
                  </div>
                </div>
                <p className="text-xs text-zinc-500">
                  {selected.voteMechanism === 'supermajority76'
                    ? 'Passes if FOR share is at least 76%.'
                    : 'Passes if FOR share is at least 60%.'}{' '}
                  Current FOR share:{' '}
                  <span className="font-mono font-semibold text-zinc-900">
                    {(
                      (forVotes / Math.max(forVotes + againstVotes, 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </p>
              </div>
            )}

            {selected.voteMechanism === 'approval' && (
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <p className="text-sm font-semibold text-zinc-900">
                  Approval voting
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  Validator already ensured enough candidate signals (
                  {selected.approvalSignalsNeeded}). The Governor records
                  preference per candidate—this preview collapses that into a
                  single pass/fail once forwarded.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={tallyGovernor}
              className="mt-6 w-full rounded-2xl bg-zinc-900 py-3.5 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Finalize outcome
            </button>
          </div>
        )}

        {selected && phase === 'done' && outcome && (
          <div
            className={`rounded-3xl border p-6 shadow-sm md:p-8 ${
              outcome === 'passed'
                ? 'border-emerald-200 bg-emerald-50/60'
                : 'border-rose-200 bg-rose-50/60'
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
              Result
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
              {outcome === 'passed' ? 'Proposal passes' : 'Proposal fails'}
            </p>
            <p className="mt-2 text-sm text-zinc-700">
              {outcome === 'passed'
                ? 'In production this would queue execution on the Timelock after delays.'
                : 'Voters rejected the upgrade or vetoed the optimistic window.'}
            </p>
            <button
              type="button"
              onClick={pickAnother}
              className="mt-6 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Simulate another proposal
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
