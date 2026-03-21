"use client";

import { useState } from "react";
import { User, Bell, Shield, Github, CreditCard, Trash2, CheckCircle2, ChevronRight } from "lucide-react";

const sections = [
  { id: "profile",      icon: User,       label: "Profile" },
  { id: "notifications",icon: Bell,       label: "Notifications" },
  { id: "security",     icon: Shield,     label: "Security" },
  { id: "integrations", icon: Github,     label: "Integrations" },
  { id: "billing",      icon: CreditCard, label: "Billing" },
  { id: "danger",       icon: Trash2,     label: "Danger Zone" },
];

function SectionCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-black/[0.05] rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-black/[0.05]">
        <h2 className="font-bold text-sm text-[#111111]">{title}</h2>
        {desc && <p className="text-xs text-black/40 mt-0.5">{desc}</p>}
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
      <div className="md:w-40 shrink-0">
        <label className="text-xs font-bold text-[#111111] block">{label}</label>
        {hint && <p className="text-[10px] text-black/40 mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Input({ defaultValue, placeholder, type = "text" }: { defaultValue?: string; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="w-full bg-[#F5F4F0] border border-transparent rounded-xl px-4 py-2.5 text-sm text-[#111111] placeholder:text-black/30 focus:outline-none focus:border-[#2A6948]/40 focus:bg-white transition-all"
    />
  );
}

function Toggle({ defaultOn = false, label }: { defaultOn?: boolean; label: string }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#111111]">{label}</span>
      <button onClick={() => setOn(!on)} className={`relative w-10 h-5.5 rounded-full transition-colors ${on ? "bg-[#2A6948]" : "bg-black/10"}`} style={{ height: "22px" }}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="pb-16">
      <div className="mb-8">
        <p className="text-xs font-mono font-semibold text-black/30 uppercase tracking-[0.15em] mb-2">Mirai / Settings</p>
        <h1 className="text-3xl font-bold tracking-tight text-[#111111] mb-1">Settings</h1>
        <p className="text-sm text-black/50">Manage your account, integrations, and notification preferences.</p>
      </div>

      <div className="flex gap-8">
        {/* Left nav */}
        <nav className="w-44 shrink-0 space-y-0.5">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                activeSection === s.id
                  ? "bg-[#2A6948]/10 text-[#2A6948] font-semibold"
                  : "text-black/60 hover:text-[#111111] hover:bg-black/[0.04]"
              }`}
            >
              <s.icon className={`w-4 h-4 shrink-0 ${activeSection === s.id ? "text-[#2A6948]" : "text-black/40"}`} />
              {s.label}
              {activeSection === s.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2A6948]" />}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 space-y-5 min-w-0">

          {activeSection === "profile" && (
            <>
              <SectionCard title="Profile" desc="Your public identity on Mirai.">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#111111] flex items-center justify-center text-white text-xl font-bold shrink-0">DK</div>
                  <div>
                    <button className="text-xs font-bold border border-black/[0.08] bg-[#F5F4F0] hover:bg-black/[0.05] px-3 py-2 rounded-lg transition-colors">Change avatar</button>
                    <p className="text-[10px] text-black/40 mt-1.5">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
                <div className="border-t border-black/[0.04]" />
                <Field label="Full name"><Input defaultValue="David Kasompe" /></Field>
                <Field label="Email" hint="Used for login and notifications."><Input defaultValue="david@example.com" type="email" /></Field>
                <Field label="Username"><Input defaultValue="davidkasompe" /></Field>
                <Field label="Bio" hint="Optional short description.">
                  <textarea
                    defaultValue="Software engineer. Building Mirai."
                    rows={3}
                    className="w-full bg-[#F5F4F0] border border-transparent rounded-xl px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#2A6948]/40 focus:bg-white transition-all resize-none"
                  />
                </Field>
              </SectionCard>
            </>
          )}

          {activeSection === "notifications" && (
            <SectionCard title="Notifications" desc="Choose when and how Mirai notifies you.">
              <div className="space-y-4">
                <Toggle defaultOn label="Email me when a Critical bug is detected" />
                <Toggle defaultOn label="Email me when a patch is ready to merge" />
                <Toggle label="Send weekly bug digest on Mondays" />
                <Toggle defaultOn label="Notify me when a workflow fails" />
                <Toggle label="Marketing and product updates" />
              </div>
            </SectionCard>
          )}

          {activeSection === "security" && (
            <SectionCard title="Security" desc="Control authentication and active sessions.">
              <Field label="Current password"><Input type="password" placeholder="••••••••" /></Field>
              <Field label="New password"><Input type="password" placeholder="At least 12 characters" /></Field>
              <Field label="Confirm password"><Input type="password" placeholder="Repeat new password" /></Field>
              <div className="border-t border-black/[0.04]" />
              <Field label="Two-factor auth" hint="Adds an extra layer of security.">
                <button className="text-xs font-bold bg-[#F5F4F0] hover:bg-black/[0.05] border border-black/[0.08] px-4 py-2 rounded-lg transition-colors">Enable 2FA</button>
              </Field>
              <div className="border-t border-black/[0.04]" />
              <div>
                <p className="text-xs font-bold text-[#111111] mb-3">Active Sessions</p>
                {[
                  { device: "Chrome · macOS", location: "Johannesburg, ZA", time: "Now" },
                  { device: "Safari · iPhone",location: "Cape Town, ZA",    time: "2d ago" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-black/[0.04] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#111111]">{s.device}</p>
                      <p className="text-xs text-black/40">{s.location} · {s.time}</p>
                    </div>
                    {s.time !== "Now" && <button className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">Revoke</button>}
                    {s.time === "Now" && <span className="text-[10px] font-bold text-[#2A6948] bg-[#2A6948]/10 px-2 py-0.5 rounded-full">Current</span>}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {activeSection === "integrations" && (
            <SectionCard title="Integrations" desc="Connected services and third-party apps.">
              {[
                { name: "GitHub",    desc: "Repo access for auto-patching PRs.",           connected: true },
                { name: "Slack",     desc: "Receive channel alerts for new bugs.",          connected: false },
                { name: "Jira",      desc: "Sync resolved bugs as closed Jira tickets.",    connected: false },
                { name: "Datadog",   desc: "Ingest runtime traces directly from Datadog.",  connected: false },
              ].map(s => (
                <div key={s.name} className="flex items-center justify-between gap-4 py-1">
                  <div>
                    <p className="text-sm font-semibold text-[#111111]">{s.name}</p>
                    <p className="text-xs text-black/40">{s.desc}</p>
                  </div>
                  {s.connected
                    ? <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#2A6948] bg-[#2A6948]/10 px-3 py-1.5 rounded-lg"><CheckCircle2 className="w-3 h-3" /> Connected</span>
                    : <button className="text-[10px] font-bold border border-black/[0.08] bg-[#F5F4F0] hover:bg-black/[0.05] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">Connect <ChevronRight className="w-3 h-3" /></button>
                  }
                </div>
              ))}
            </SectionCard>
          )}

          {activeSection === "billing" && (
            <SectionCard title="Billing" desc="Current plan and payment method.">
              <div className="flex items-center justify-between p-5 bg-[#2A6948]/[0.06] border border-[#2A6948]/10 rounded-xl">
                <div>
                  <p className="font-bold text-sm text-[#111111]">Mirai Pro</p>
                  <p className="text-xs text-black/50 mt-0.5">Unlimited bugs · 5 repos · Workflow automation</p>
                </div>
                <span className="text-[#2A6948] font-bold text-xl">$29<span className="text-sm font-medium text-black/40">/mo</span></span>
              </div>
              <Field label="Card on file">
                <div className="flex items-center gap-3 bg-[#F5F4F0] rounded-xl px-4 py-2.5">
                  <CreditCard className="w-4 h-4 text-black/40" />
                  <span className="text-sm font-mono text-[#111111]">•••• •••• •••• 4242</span>
                  <button className="ml-auto text-xs font-bold text-[#2A6948] hover:underline">Update</button>
                </div>
              </Field>
              <Field label="Next billing"><span className="text-sm text-[#111111]">April 20, 2026</span></Field>
              <button className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">Cancel subscription</button>
            </SectionCard>
          )}

          {activeSection === "danger" && (
            <div className="bg-white border border-red-100 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-red-100 bg-red-50/50">
                <h2 className="font-bold text-sm text-red-700">Danger Zone</h2>
                <p className="text-xs text-red-500/70 mt-0.5">These actions are irreversible. Please be certain.</p>
              </div>
              <div className="px-6 py-5 space-y-4">
                {[
                  { label: "Export account data",   desc: "Download all your bugs, patches, and workflow history.",  action: "Export", danger: false },
                  { label: "Disconnect all repos",  desc: "Remove Mirai's access to all connected GitHub repos.",    action: "Disconnect", danger: true },
                  { label: "Delete account",        desc: "Permanently delete your Mirai account and all data.",     action: "Delete account", danger: true },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between gap-4 py-3 border-b border-black/[0.04] last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">{item.label}</p>
                      <p className="text-xs text-black/40">{item.desc}</p>
                    </div>
                    <button className={`text-xs font-bold px-4 py-2 rounded-xl border transition-colors shrink-0 ${
                      item.danger
                        ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                        : "border-black/[0.08] bg-[#F5F4F0] text-black/60 hover:bg-black/[0.05]"
                    }`}>{item.action}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save button (not for danger zone) */}
          {activeSection !== "danger" && (
            <div className="flex justify-end">
              <button onClick={handleSave} className="flex items-center gap-2 bg-[#2A6948] hover:bg-[#1E4A31] text-white rounded-xl py-2.5 px-6 text-sm font-bold transition-colors shadow-sm shadow-[#2A6948]/20">
                {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : "Save changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
