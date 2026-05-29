/**
 * Quita credenciales Factus del objeto Company para respuestas HTTP.
 * @param {Record<string, unknown>} company
 */
export function toPublicCompany(company) {
  if (!company || typeof company !== "object") return company;
  const c = { ...company };
  const configured = Boolean(
    c.factusClientId && c.factusClientSecret && c.factusUsername && c.factusPassword
  );
  delete c.factusClientId;
  delete c.factusClientSecret;
  delete c.factusUsername;
  delete c.factusPassword;
  return {
    ...c,
    factusElectronicInvoicingConfigured: configured,
  };
}
