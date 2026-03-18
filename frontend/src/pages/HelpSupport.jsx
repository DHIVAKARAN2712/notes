import React, { useState } from 'react';

const faqs = [
  { q:'How do I upload notes?', a:'Only admins can upload notes. Click "Upload Notes" in the sidebar or the Upload button on the dashboard.' },
  { q:'How do I join a group?', a:'Click "Groups" in the sidebar, then click "Join Group" and enter the invite code provided by your admin.' },
  { q:'How do I save notes for later?', a:'Click the bookmark icon (🔖) on any note card. Find saved notes in the "Saved Notes" section.' },
  { q:'How do I download notes?', a:'Click the download icon on any note card to save the file to your device.' },
  { q:'How do I preview a PDF note?', a:'PDF notes show an eye icon. Click it to open an inline preview without downloading.' },
  { q:'How does the AI assistant work?', a:'Click the AI icon (⚡) on any note to open the AI assistant. It can summarize the note and answer your questions.' },
  { q:'How do I message the admin?', a:'Go to Messages in the sidebar and click "New Message" to send a question to the admin.' },
  { q:'Can I comment on notes?', a:'Yes! Click the comment bubble icon on any note card to view and post comments.' },
];

export default function HelpSupport() {
  const [open, setOpen] = useState(null);

  return (
    <div className="flex-1 overflow-y-auto t-bg p-6">
      <div className="mb-6">
        <nav className="t-muted text-sm mb-1"><span>Notes</span><span className="mx-2">›</span><span className="t-text font-semibold">Help & Support</span></nav>
        <h1 className="t-text font-bold text-2xl">Help & Support</h1>
      </div>

      <div className="max-w-2xl space-y-4">
        {/* Hero */}
        <div className="rounded-2xl p-6" style={{background:'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))', border:'1px solid rgba(59,130,246,0.2)'}}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
            </div>
            <h2 className="t-text font-bold text-lg">EduWallet Support</h2>
          </div>
          <p className="t-text-2 text-sm">Find answers below. For additional help, send a message to your admin through the Messages section.</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {icon:"M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z", label:'Notes Guide', color:'bg-blue-500/10 text-blue-400'},
            {icon:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", label:'Messaging', color:'bg-green-500/10 text-green-400'},
            {icon:"M12 2a10 10 0 1 0 10 10", label:'AI Features', color:'bg-yellow-500/10 text-yellow-400'},
          ].map(item => (
            <div key={item.label} className="t-card rounded-xl p-4 text-center cursor-default">
              <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={item.icon}/></svg>
              </div>
              <p className="t-text text-xs font-semibold">{item.label}</p>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div>
          <h3 className="t-text font-semibold mb-3">Frequently Asked Questions</h3>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="t-card rounded-xl overflow-hidden">
                <button onClick={() => setOpen(open===i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left t-hover transition-colors">
                  <span className="t-text text-sm font-medium pr-4">{faq.q}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`t-muted flex-shrink-0 transition-transform duration-200 ${open===i?'rotate-180':''}`}>
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
                {open===i && (
                  <div className="px-5 pb-4 pt-1 border-t" style={{borderColor:'var(--border)'}}>
                    <p className="t-text-2 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="t-card rounded-2xl p-5 text-center">
          <p className="t-text font-semibold text-sm mb-1">Still need help?</p>
          <p className="t-muted text-xs">Use the Messages section to contact your admin directly.</p>
        </div>
      </div>
    </div>
  );
}
