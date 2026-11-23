/** Construit un faux JWT pour les tests (la signature n'est pas vérifiée côté navigateur). */
export function fakeJwt(payload: object): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${b64({ alg: 'RS256' })}.${b64(payload)}.signature`
}
