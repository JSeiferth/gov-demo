export type ProposalCategory =
  | 'Protocol change'
  | 'Budget / parameter'
  | 'Governance admin'
  | 'Elections'
  | 'Accountability'

export type VoteMechanism =
  | 'optimistic'
  | 'supermajority76'
  | 'majority60'
  | 'approval'

export type ProposalType = {
  id: string
  name: string
  category: ProposalCategory
  purpose: string
  initiator: string
  entry: string
  decision: string
  /** Simulated validator: delegate-style approvals before Governor */
  requiredApprovals: number
  /** Simulated DAB attestation step */
  requiresDab: boolean
  voteMechanism: VoteMechanism
  /** For approval-vote types: signals needed (UI counter target) */
  approvalSignalsNeeded: number
}

export const PROPOSAL_TYPES: ProposalType[] = [
  {
    id: 'core-upgrade',
    name: 'Protocol / Governor upgrade (core dev)',
    category: 'Protocol change',
    purpose:
      'Scheduled protocol and governor contract changes with controlled submission.',
    initiator: 'OP Labs or Foundation via delegated submitter, with DAB approval.',
    entry: 'Voting-cycle enforcement.',
    decision: 'Optimistic approval / veto',
    requiredApprovals: 0,
    requiresDab: true,
    voteMechanism: 'optimistic',
    approvalSignalsNeeded: 0,
  },
  {
    id: 'maintenance',
    name: 'Maintenance upgrade',
    category: 'Protocol change',
    purpose:
      'Urgent maintenance, bugfixes, or L1 response without material UX or governance change.',
    initiator: 'OP Labs or Foundation via delegated submitter.',
    entry:
      'Must not introduce material behavioral change; no separate pre-approval step.',
    decision: 'Optimistic approval / veto',
    requiredApprovals: 0,
    requiresDab: false,
    voteMechanism: 'optimistic',
    approvalSignalsNeeded: 0,
  },
  {
    id: 'perm-upgrade',
    name: 'Protocol / Governor upgrade (permissionless)',
    category: 'Protocol change',
    purpose: 'Same class of upgrade as core path, opened to broader initiation.',
    initiator: 'Anyone via the delegated submitter flow.',
    entry: 'Four delegate or citizen approvals; voting-cycle enforcement.',
    decision: 'Supermajority (76%)',
    requiredApprovals: 4,
    requiresDab: false,
    voteMechanism: 'supermajority76',
    approvalSignalsNeeded: 0,
  },
  {
    id: 'set-allowance',
    name: 'Set allowance (annual Labs budget)',
    category: 'Budget / parameter',
    purpose: 'Set the annual Labs budget within agreed guardrails.',
    initiator: 'OP Labs via delegated submitter.',
    entry: 'Range limits; four approvals; voting-cycle enforcement.',
    decision: 'Optimistic approval / veto',
    requiredApprovals: 4,
    requiresDab: false,
    voteMechanism: 'optimistic',
    approvalSignalsNeeded: 0,
  },
  {
    id: 'submitter-role',
    name: 'Update delegated submitter role',
    category: 'Governance admin',
    purpose: 'Change who may act as delegated submitter for eligible proposals.',
    initiator: 'Permissionless submission.',
    entry: 'Four approvals; voting-cycle enforcement.',
    decision: 'Supermajority (76%)',
    requiredApprovals: 4,
    requiresDab: false,
    voteMechanism: 'supermajority76',
    approvalSignalsNeeded: 0,
  },
  {
    id: 'elect-sc',
    name: 'Elect Security Council',
    category: 'Elections',
    purpose: 'Elect Security Council representatives.',
    initiator:
      'Permissionless nominations with delegated submitter election flow.',
    entry: 'Eight approval signals per candidate; voting-cycle enforcement.',
    decision: 'Approval voting',
    requiredApprovals: 0,
    requiresDab: false,
    voteMechanism: 'approval',
    approvalSignalsNeeded: 8,
  },
  {
    id: 'elect-dab',
    name: 'Elect Dev Advisory Board',
    category: 'Elections',
    purpose: 'Elect Dev Advisory Board representatives.',
    initiator:
      'Permissionless nominations with delegated submitter election flow.',
    entry: 'Four approval signals per candidate; voting-cycle enforcement.',
    decision: 'Approval voting',
    requiredApprovals: 0,
    requiresDab: false,
    voteMechanism: 'approval',
    approvalSignalsNeeded: 4,
  },
  {
    id: 'rep-removal',
    name: 'Representative removal',
    category: 'Accountability',
    purpose: 'Remove representative-level governance members.',
    initiator: 'Permissionless via delegated submitter flow.',
    entry: 'Four approvals; voting-cycle enforcement.',
    decision: 'Majority (60%)',
    requiredApprovals: 4,
    requiresDab: false,
    voteMechanism: 'majority60',
    approvalSignalsNeeded: 0,
  },
  {
    id: 'director-removal',
    name: 'Director removal',
    category: 'Accountability',
    purpose: 'Remove a Foundation director.',
    initiator: 'Permissionless submission.',
    entry: 'Four approvals; voting-cycle enforcement.',
    decision: 'Supermajority (76%)',
    requiredApprovals: 4,
    requiresDab: false,
    voteMechanism: 'supermajority76',
    approvalSignalsNeeded: 0,
  },
]

export const CATEGORY_STYLES: Record<
  ProposalCategory,
  { chip: string; dot: string }
> = {
  'Protocol change': {
    chip: 'bg-sky-100 text-sky-900 ring-sky-200/80',
    dot: 'bg-sky-500',
  },
  'Budget / parameter': {
    chip: 'bg-amber-100 text-amber-950 ring-amber-200/80',
    dot: 'bg-amber-500',
  },
  'Governance admin': {
    chip: 'bg-violet-100 text-violet-900 ring-violet-200/80',
    dot: 'bg-violet-500',
  },
  Elections: {
    chip: 'bg-emerald-100 text-emerald-950 ring-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  Accountability: {
    chip: 'bg-rose-100 text-rose-900 ring-rose-200/80',
    dot: 'bg-rose-500',
  },
}

export const CATEGORIES: ProposalCategory[] = [
  'Protocol change',
  'Budget / parameter',
  'Governance admin',
  'Elections',
  'Accountability',
]
