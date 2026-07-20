const handleDispatchPayload = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setStatusMessage('')

  try {
    // 1. Resolve active logged-in user profile & role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized footprint.")

    const { data: userProfile } = await supabase
      .from('crm_contacts')
      .select('role')
      .eq('email', user.email)
      .single()

    let targetEmail = ''

    // 2. THE SECURITY GATEWAY
    if (userProfile?.role === 'SYSTEM_ADMIN') {
      // 👑 ADMIN CLEARANCE: Look up any client or entity typed in the channel input
      const { data: recipientRecord } = await supabase
        .from('crm_contacts')
        .select('email')
        .or(`email.ilike.%${recipientChannel}%,company_name.ilike.%${recipientChannel}%`)
        .limit(1)
        .single()

      if (!recipientRecord) throw new Error("Target channel could not be resolved.")
      targetEmail = recipientRecord.email
    } else {
      // 🔒 CLIENT SANDBOX: Ignore free-text input. Hardcode routing strictly to internal support
      // Maps options like "V&K Tactical Support" directly to your internal staff nodes
      if (recipientChannel.includes('Support')) {
        targetEmail = 'support@vkpartners.co'
      } else {
        targetEmail = 'admin@vkpartners.co'
      }
    }

    // 3. EXECUTE COGNITIVE LEDGER INSERTION
    const { error: dispatchError } = await supabase
      .from('crm_messages')
      .insert({
        sender_email: user.email,
        recipient_email: targetEmail,
        subject: subjectLine,
        payload: payloadData,
        status: 'DELIVERED',
        created_at: new Date().toISOString()
      })

    if (dispatchError) throw dispatchError
    setStatusMessage(`🚀 Payload successfully routed to: [${targetEmail}]`)
  } catch (err: any) {
    setStatusMessage(`❌ Dispatch Aborted: ${err.message}`)
  } finally {
    setLoading(false)
  }
}