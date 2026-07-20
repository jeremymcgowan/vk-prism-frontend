import ClientProfileSettings from '../../components/ClientProfileSettings'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-black p-6 space-y-6">
      <div className="max-w-xl mx-auto font-mono text-[11px] text-zinc-600 tracking-wider uppercase mb-2">
        System Core ➔ Dashboard ➔ Account Settings
      </div>
      <ClientProfileSettings />
    </div>
  )
}