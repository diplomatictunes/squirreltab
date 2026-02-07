import { getDomain, normalizeDomain } from './utils'

const normalizeRuleSet = rawRules => {
  if (!Array.isArray(rawRules)) return []
  const sanitized = rawRules
    .map(normalizeDomain)
    .filter(Boolean)
  return Array.from(new Set(sanitized))
}

const domainMatches = (domain, pattern) => {
  if (!domain || !pattern) return false
  return domain === pattern || domain.endsWith(`.${pattern}`)
}

export const filterTabsForPrivacy = (tabs, excludedDomainsRaw) => {
  const normalizedRules = normalizeRuleSet(excludedDomainsRaw)
  const sourceTabs = Array.isArray(tabs) ? tabs : []
  if (normalizedRules.length === 0) {
    return {
      allowedTabs: sourceTabs,
      allowedCount: sourceTabs.length,
      excludedCount: 0,
      totalCount: sourceTabs.length,
      excludedDomains: [],
    }
  }

  const allowedTabs = []
  let excludedCount = 0

  for (const tab of sourceTabs) {
    const url = tab?.url || ''
    const domain = normalizeDomain(getDomain(url))
    if (domain && normalizedRules.some(rule => domainMatches(domain, rule))) {
      excludedCount += 1
      continue
    }
    allowedTabs.push(tab)
  }

  return {
    allowedTabs,
    allowedCount: allowedTabs.length,
    excludedCount,
    totalCount: sourceTabs.length,
    excludedDomains: normalizedRules,
  }
}
