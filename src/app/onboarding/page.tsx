// --- Clean & Sanitize Domain Input on Blur ---
  const handleUrlBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let raw = e.target.value.trim().toLowerCase();
    if (!raw || raw === 'i need a website!') return;

    // 1. Remove http://, https://, www., spaces
    raw = raw
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\s+/g, '');

    // 2. Strip semicolons, commas, and invalid domain characters
    raw = raw.replace(/[^a-z0-9\.\-]/gi, '');

    // 3. Remove trailing slashes or dots
    raw = raw.replace(/[\.\/]+$/, '');

    // 4. Validate domain structure
    const domainRegex = /^[a-[#a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z]{2,11}$/;

    if (domainRegex.test(raw)) {
      updateFormData({ company_url: raw });
    } else if (raw.length > 2 && !raw.includes('.')) {
      // Bare word like "acme" -> "acme.com"
      updateFormData({ company_url: `${raw}.com` });
    } else {
      // If still invalid junk (e.g. "34590345dfksldkflsj223049-0fsdk.com"), wipe or reset
      updateFormData({ company_url: '' });
    }
  };