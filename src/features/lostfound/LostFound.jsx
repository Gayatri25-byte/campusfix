import { useState } from 'react'
import { PackageSearch, Lock, KeyRound, Check, X } from 'lucide-react'
import { useStore } from '../../app/StoreProvider.jsx'
import { Page, Card, Btn, Field, Badge, DemoTag, Tabs, EmptyState, ago } from '../../components/ui/index.jsx'

const STEPS = ['open', 'claim_pending', 'ready_for_pickup', 'returned']

function ClaimBox({ item }) {
  const { submitClaim } = useStore()
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  if (!open) return <Btn variant="ghost" onClick={() => setOpen(true)}>This is mine: claim it</Btn>
  return (
    <div className="pop mt-3 w-full rounded-xl bg-navy-50 p-4">
      <Field label="Prove it is yours">
        <textarea className="input" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Describe something only the owner would know: marks, contents, lock-screen, serial number…" />
      </Field>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-navy-500"><Lock size={12} aria-hidden="true" />Only the finder, staff and administrators can read this. It is never shown publicly.</p>
      <div className="mt-3 flex gap-2">
        <Btn onClick={async () => (await submitClaim(item.id, text)) && setOpen(false)}>Submit claim</Btn>
        <Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
      </div>
    </div>
  )
}

function Handover({ claim }) {
  const { confirmHandover } = useStore()
  const [code, setCode] = useState('')
  return (
    <div className="mt-2 flex flex-wrap items-end gap-2">
      <Field label="Pickup code shown by the claimant">
        <input className="input !w-40" inputMode="numeric" maxLength={4} value={code} onChange={(e) => setCode(e.target.value)} />
      </Field>
      <Btn onClick={() => confirmHandover(claim.id, code)}><KeyRound size={15} />Confirm handover</Btn>
    </div>
  )
}

function ItemCard({ x }) {
  const { me, users, claims, closeItem, reviewClaim, can, role } = useStore()
  const reviewer = role === 'admin' || can('review_found') || x.posterId === me.id
  const itemClaims = claims.filter((c) => c.itemId === x.id)
  const myClaim = itemClaims.find((c) => c.claimantId === me.id && c.status !== 'rejected')
  const name = (id) => users.find((u) => u.id === id)?.name || 'Someone'
  const claimable = x.type === 'found' && ['open', 'claim_pending', 'disputed'].includes(x.status) && x.posterId !== me.id && !myClaim
  const stepIdx = STEPS.indexOf(x.status === 'disputed' ? 'claim_pending' : x.status)
  return (
    <Card className={`!p-4 hover:!translate-y-0 ${x.status === 'returned' ? 'opacity-70' : ''}`}>
      <div className="flex items-start gap-3">
        <PackageSearch className="mt-0.5 shrink-0 text-teal-600" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">{x.item} {x.demo && <DemoTag />}</p>
          <p className="text-xs text-navy-500">
            <b className="uppercase">{x.type}</b> · {x.location} · {ago(x.date)} · posted by {name(x.posterId)}
          </p>
          {x.type === 'found' && (
            <ol className="mt-2 flex items-center gap-1 text-[11px] text-navy-500" aria-label="Progress">
              {STEPS.map((s, i) => (
                <li key={s} className={`flex items-center gap-1 ${i <= stepIdx ? 'font-semibold text-teal-700' : ''}`}>
                  <span className={`h-2 w-2 rounded-full ${i <= stepIdx ? 'bg-teal-500' : 'bg-navy-200'}`} />
                  {s === 'open' ? 'Found' : s === 'claim_pending' ? 'Claimed' : s === 'ready_for_pickup' ? 'Approved' : 'Returned'}
                  {i < 3 && <span className="mx-1 h-px w-4 bg-navy-200" />}
                </li>
              ))}
            </ol>
          )}
        </div>
        <Badge s={x.status} />
      </div>

      {x.type === 'found' && x.hasPrivate && !x.privateDetail && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-navy-500"><Lock size={12} aria-hidden="true" />Identifying details are kept private. Claim the item to prove ownership.</p>
      )}
      {x.privateDetail && x.type === 'found' && (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm"><b>Private detail (reviewers only):</b> {x.privateDetail}</p>
      )}
      {x.contact && <p className="mt-2 text-xs text-navy-500">Contact (private to you): {x.contact}</p>}

      {myClaim && (
        <div className="mt-3 rounded-lg bg-teal-50 p-3 text-sm">
          <p className="flex items-center gap-2">Your claim: <Badge s={myClaim.status} /></p>
          {myClaim.status === 'approved' && myClaim.pickupCode && (
            <p className="mt-2">Pickup code: <span className="rounded bg-white px-2 py-1 font-mono text-lg font-bold tracking-widest">{myClaim.pickupCode}</span><span className="mt-1 block text-xs text-navy-500">Show this at the handover desk with your ID. Do not share it.</span></p>
          )}
        </div>
      )}

      {reviewer && itemClaims.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">Claims ({itemClaims.length}){x.status === 'disputed' && ' · disputed: administrator decides'}</p>
          {itemClaims.map((c) => (
            <div key={c.id} className="rounded-lg border border-navy-100 p-3 text-sm">
              <div className="flex items-center justify-between gap-2"><b>{name(c.claimantId)}</b><Badge s={c.status} /></div>
              <p className="mt-1 text-navy-700">“{c.evidence}”</p>
              {c.status === 'pending' && (
                <div className="mt-2 flex gap-2">
                  <Btn onClick={() => reviewClaim(c.id, 'approve')}><Check size={14} />Approve</Btn>
                  <Btn variant="ghost" onClick={() => reviewClaim(c.id, 'reject')}><X size={14} />Reject</Btn>
                </div>
              )}
              {c.status === 'approved' && (role === 'admin' || can('handover') || x.posterId === me.id) && <Handover claim={c} />}
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {claimable && <ClaimBox item={x} />}
        {x.type === 'lost' && x.status !== 'returned' && (x.posterId === me.id || role === 'admin') && (
          <Btn variant="ghost" onClick={() => closeItem(x.id)}><Check size={14} />I got it back</Btn>
        )}
      </div>
    </Card>
  )
}

export default function LostFound() {
  const { items, claims, addItem, me, role, can } = useStore()
  const [f, setF] = useState({ type: 'lost', item: '', location: '', contact: '', privateDetail: '' })
  const [flt, setFlt] = useState('all')
  const [tab, setTab] = useState('browse')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const reviewQueue = claims.filter((c) => c.status === 'pending' || c.status === 'approved')
  const submit = async (e) => {
    e.preventDefault()
    if (await addItem(f)) setF({ ...f, item: '', location: '', contact: '', privateDetail: '' })
  }
  const involved = (x) => x.posterId === me.id || claims.some((c) => c.itemId === x.id && c.claimantId === me.id)
  const inTab = (x) => (tab === 'browse' ? true : tab === 'mine' ? involved(x) : reviewQueue.some((c) => c.itemId === x.id))
  const list = items.filter((x) => (flt === 'all' || x.type === flt) && inTab(x))
  const showQueue = role === 'admin' || can('review_found')
  return (
    <Page title="Lost & Found" sub="Ownership is proven privately, approved by a reviewer, and finished with a secure pickup code.">
      <Tabs label="Lost and found views" value={tab} onChange={setTab} tabs={[['browse', 'Browse'], ['mine', 'My posts & claims'], ...(showQueue ? [['queue', 'Review queue', reviewQueue.filter((c) => c.status === 'pending').length]] : [])]} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="h-fit hover:!translate-y-0">
          <h2 className="text-xl font-semibold">Post an item</h2>
          <form onSubmit={submit} noValidate className="mt-4 space-y-3">
            <Field label="Type">
              <select className="input" value={f.type} onChange={set('type')}>
                <option value="lost">I lost something</option>
                <option value="found">I found something</option>
              </select>
            </Field>
            <Field label="Item"><input className="input" value={f.item} onChange={set('item')} /></Field>
            <Field label="Where"><input className="input" value={f.location} onChange={set('location')} /></Field>
            {f.type === 'found' && (
              <Field label="Private detail (not shown publicly)">
                <input className="input" value={f.privateDetail} onChange={set('privateDetail')} placeholder="e.g. a sticker inside the cover" />
              </Field>
            )}
            <Field label="Contact (private, optional)"><input className="input" value={f.contact} onChange={set('contact')} placeholder="Email or desk" /></Field>
            <Btn type="submit" className="w-full">Post item</Btn>
          </form>
        </Card>
        <div className="lg:col-span-2">
          <div className="mb-3 flex gap-2">
            {['all', 'lost', 'found'].map((k) => (
              <button key={k} onClick={() => setFlt(k)} aria-pressed={flt === k} className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${flt === k ? 'bg-teal-500 text-navy-950' : 'bg-white'}`}>{k}</button>
            ))}
          </div>
          <div className="space-y-3">
            {list.length === 0 && <EmptyState icon={PackageSearch} title="Nothing here yet">Items you post or claim will show up here.</EmptyState>}
            {list.map((x) => <ItemCard key={x.id} x={x} />)}
          </div>
        </div>
      </div>
    </Page>
  )
}
