export function onlyDigits(value: string): string {
  return value.replace(/\D+/g, '')
}

export function maskCpfCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14)

  if (digits.length <= 11) {
    const p1 = digits.slice(0, 3)
    const p2 = digits.slice(3, 6)
    const p3 = digits.slice(6, 9)
    const p4 = digits.slice(9, 11)
    return [p1, p2, p3].filter(Boolean).join('.') + (p4 ? `-${p4}` : '')
  }

  const p1 = digits.slice(0, 2)
  const p2 = digits.slice(2, 5)
  const p3 = digits.slice(5, 8)
  const p4 = digits.slice(8, 12)
  const p5 = digits.slice(12, 14)

  return (
    [p1, p2, p3].filter(Boolean).join('.') +
    (p4 ? `/${p4}` : '') +
    (p5 ? `-${p5}` : '')
  )
}

