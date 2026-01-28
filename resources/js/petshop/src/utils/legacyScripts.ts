type LegacyScriptLoadOptions = {
  id: string
  src: string
}

export function loadLegacyScriptOnce({ id, src }: LegacyScriptLoadOptions): Promise<void> {
  const existing = document.getElementById(id)
  if (existing) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = id
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Falha ao carregar script legado: ${src}`))
    document.body.appendChild(script)
  })
}

type LegacyStyleLoadOptions = {
  id: string
  href: string
}

export function loadLegacyStyleOnce({ id, href }: LegacyStyleLoadOptions): void {
  const existing = document.getElementById(id)
  if (existing) return

  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}

export function removeLegacyTag(id: string): void {
  const existing = document.getElementById(id)
  if (!existing) return
  existing.parentElement?.removeChild(existing)
}

export function initLegacyUiBindings(): void {
  const w = window as any
  const $: any = w?.$
  if (!$) return

  try {
    if (typeof w.FuncoesBasicas === 'function') w.FuncoesBasicas()
  } catch {
    // ignore
  }

  // Select2 (quando existir no bundle)
  try {
    if ($?.fn?.select2) {
      $('.form-select2')
        .not('.select2-hidden-accessible')
        .each(function (this: any) {
          const el = $(this)
          el.select2({ width: '100%' })

          if (el.is('[readonly]')) {
            el.prop('disabled', true)
            el.trigger('change.select2')
          }
        })
    }
  } catch {
    // ignore
  }

  // Tooltip/popover (Bootstrap via Base.js)
  try {
    $('[data-toggle="tooltip"]').tooltip({ container: 'body' })
    $('[data-toggle="popover"]').popover({ trigger: 'hover' })
  } catch {
    // ignore
  }

  // Menu suspenso (tabela)
  try {
    $('.menu-suspenso-tabela .icone-trigger')
      .off('click.codex')
      .popover({
        html: true,
        placement: 'left',
        trigger: 'manual',
        content: function (this: any) {
          return $(this).siblings('.menu-content').html()
        },
      })

    $('.menu-suspenso-tabela')
      .off('click.codex', '.icone-trigger')
      .on('click.codex', '.icone-trigger', function (this: any) {
        $('.menu-suspenso-tabela .icone-trigger')
          .not(this)
          .each(function (this: any) {
            $(this).popover('hide')
            $(this).closest('tr').removeClass('selecionada')
          })

        if ($(this).parent().find('.popover').length === 0) {
          $(this).closest('tr').addClass('selecionada')
          $(this).popover('show')
        } else {
          $(this).popover('hide')
          $(this).closest('tr').removeClass('selecionada')
        }
      })

    $('.menu-suspenso-tabela')
      .off('click.codex', '.list-group-item')
      .on('click.codex', '.list-group-item', function (this: any) {
        $(this).closest('.menu-suspenso-tabela').find('.icone-trigger').popover('hide')
      })

    $('body')
      .off('click.codex')
      .on('click.codex', function (event: any) {
        $('.menu-suspenso-tabela .icone-trigger').each(function (this: any) {
          if (
            $(this).is(event.target) ||
            $(this).has(event.target).length !== 0 ||
            $('.popover').has(event.target).length !== 0
          ) {
            return
          }

          $(this).popover('hide')
          $(this).closest('tr').removeClass('selecionada')
        })
      })
  } catch {
    // ignore
  }
}
