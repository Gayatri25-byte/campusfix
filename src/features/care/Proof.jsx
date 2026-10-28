import { useState } from 'react'
import { BadgeCheck, ThumbsDown } from 'lucide-react'
import { useStore } from '../../app/StoreProvider.jsx'
import { Page, Card, Btn, Badge, DemoTag, Field, ago } from '../../components/ui/index.jsx'
import CareTabs from './CareTabs.jsx'

export default function Proof() {
  const { issues, verify, me } = useStore()
  const [rej, setRej] = useState(null),
    [c, setC] = useState('')
  const pending = issues.filter((i) => i.status === 'Resolved' && i.reporterId === me.id),
    done = issues.filter((i) => i.status === 'Verified')
  return (
    <Page title="Proof of fix" sub="Staff show what they did. You decide whether the problem is really gone.">
      <CareTabs current="proof" />
      <h2 className="mb-3 text-xl font-semibold">Waiting for your check ({pending.length})</h2>
      {pending.length === 0 && (
        <Card className="text-navy-500 hover:!translate-y-0">
          Nothing to verify right now. Fixes to your reports appear here once staff mark them resolved.
        </Card>
      )}
      <div className="space-y-4">
        {pending.map((i) => (
          <Card key={i.id} className="hover:!translate-y-0">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {i.title} {i.demo && <DemoTag />}
                </p>
                <p className="text-xs text-navy-500">
                  {i.id} · {i.location} · fixed {ago(i.proof?.at || i.createdAt)}
                </p>
              </div>
              <Badge s="Resolved" />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-semibold text-navy-500">Before</p>
                {i.photo ? (
                  <img src={i.photo} alt="Before" className="h-36 w-full rounded-lg object-cover" />
                ) : (
                  <div className="grid h-36 place-items-center rounded-lg bg-navy-50 text-xs text-navy-500">
                    No photo submitted
                  </div>
                )}
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold text-navy-500">After (staff proof)</p>
                {i.proof?.photo ? (
                  <img src={i.proof.photo} alt="After" className="h-36 w-full rounded-lg object-cover" />
                ) : (
                  <div className="grid h-36 place-items-center rounded-lg bg-teal-50 text-xs text-teal-700">
                    No photo, note only
                  </div>
                )}
              </div>
            </div>
            <p className="mt-3 rounded-lg bg-teal-50 p-3 text-sm text-navy-700">
              <b>Staff note:</b> {i.proof?.note}
            </p>
            {rej === i.id ? (
              <div className="pop mt-4">
                <Field label="What is still wrong?">
                  <textarea className="input" rows={2} value={c} onChange={(e) => setC(e.target.value)} />
                </Field>
                <div className="mt-2 flex gap-2">
                  <Btn
                    variant="danger"
                    onClick={() => {
                      verify(i.id, false, c)
                      setRej(null)
                      setC('')
                    }}
                  >
                    Reopen issue
                  </Btn>
                  <Btn variant="ghost" onClick={() => setRej(null)}>
                    Cancel
                  </Btn>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex gap-2">
                <Btn onClick={() => verify(i.id, true)}>
                  <BadgeCheck size={16} />
                  Confirm it's fixed
                </Btn>
                <Btn variant="ghost" onClick={() => setRej(i.id)}>
                  <ThumbsDown size={16} />
                  Still broken
                </Btn>
              </div>
            )}
          </Card>
        ))}
      </div>
      <h2 className="mb-3 mt-10 text-xl font-semibold">Verified fixes ({done.length})</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {done.map((i) => (
          <Card key={i.id} className="flex items-center gap-3 !p-4">
            <BadgeCheck className="shrink-0 text-emerald-600" />
            <div className="min-w-0">
              <p className="truncate font-medium">{i.title}</p>
              <p className="truncate text-xs text-navy-500">{i.proof?.note}</p>
            </div>
          </Card>
        ))}
      </div>
    </Page>
  )
}
