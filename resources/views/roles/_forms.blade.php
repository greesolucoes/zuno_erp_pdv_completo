<div class="row g-2">
    @if(isset($item) && $item->empresa)
    <div class="col-md-4">
        {!!Form::text('', 'Empresa')->value($item->empresa->nome)->readonly() !!}
    </div>
    @endif
    <div class="col-md-3">
        {!!Form::text('name', 'Nome')
        ->required()
        ->attrs(['maxlength' => 15])!!}
    </div>
    <div class="col-md-4">
        {!!Form::text('description', 'Descrição')
        ->required()
        ->attrs(['maxlength' => 40])!!}
    </div>
    
    <div class="col-md-12 mt-3">
        <label class="form-label">Permissões</label>

        @php
            $selectedPermissions = collect(old('permissions', isset($item) ? $item->permissions->pluck('id')->all() : []))
                ->map(fn ($value) => (int) $value)
                ->filter()
                ->values()
                ->all();

            $permissionTabsLocal = $permissionTabs ?? null;
            if (! $permissionTabsLocal) {
                $permissionTabsLocal = [];
                foreach ($permissions as $permission) {
                    $name = (string) $permission->name;
                    $parts = explode('_', $name);
                    $action = array_pop($parts);
                    $resource = $parts ? implode('_', $parts) : $name;
                    $permissionTabsLocal['Configuração'][$resource][] = $permission;
                }
            }
        @endphp

        <div class="card border mt-2">
            <div class="card-body">
                <style>
                    .role-permissions__wizard-tabs {
                        display: flex;
                        flex-wrap: wrap;
                        margin-left: -1.25rem;
                        margin-right: -1.25rem;
                    }

                    .role-permissions__wizard-tabs .nav-item {
                        flex: 1 0 180px;
                        min-width: 180px;
                    }

                    .role-permissions__wizard-tabs .nav-link {
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                        white-space: normal;
                        text-align: center;
                    }

                    @media (max-width: 576px) {
                        .role-permissions__wizard-tabs .nav-item {
                            flex-basis: 140px;
                            min-width: 140px;
                        }
                    }
                </style>

                <div class="row g-2 align-items-end">
                    <div class="col-md-6">
                        <label class="form-label mb-1">Buscar</label>
                        <input
                            id="role-permissions-search"
                            type="text"
                            class="form-control"
                            placeholder="Digite para filtrar permissões..."
                            autocomplete="off"
                        />
                    </div>
                    <div class="col-md-6 d-flex gap-2 justify-content-md-end">
                        <div class="form-check mt-4 mt-md-0">
                            <input class="form-check-input" type="checkbox" id="role-permissions-check-all-visible">
                            <label class="form-check-label" for="role-permissions-check-all-visible">
                                Marcar todos (visíveis)
                            </label>
                        </div>
                    </div>
                </div>

                <hr class="my-3">

                @php
                    $moduleIcons = [
                        'Produtos' => 'ri-store-2-line',
                        'Atendimento' => 'ri-hospital-line',
                        'Serviços' => 'ri-tools-line',
                        'Ordem de Serviço' => 'ri-file-list-3-line',
                        'Ordem de Produção' => 'ri-building-2-line',
                        'Agendamentos' => 'ri-calendar-line',
                        'Usuários' => 'ri-user-3-line',
                        'Pessoas' => 'ri-team-line',
                        'Gestão Pessoal' => 'ri-user-settings-line',
                        'Compras' => 'ri-shopping-bag-line',
                        'Devolução' => 'ri-arrow-go-back-fill',
                        'PDV' => 'ri-shopping-cart-fill',
                        'Vendas' => 'ri-file-list-fill',
                        'Financeiro' => 'ri-money-dollar-box-fill',
                        'NFCe' => 'ri-receipt-line',
                        'Pré Venda' => 'ri-shopping-basket-line',
                        'Cardápio' => 'ri-restaurant-line',
                        'NFSe' => 'ri-file-paper-2-line',
                        'Veículos' => 'ri-truck-line',
                        'Planejamento de Custos' => 'ri-line-chart-line',
                        'Controle de Fretes' => 'ri-road-map-line',
                        'CTe' => 'ri-truck-fill',
                        'CTe Os' => 'ri-truck-line',
                        'MDFe' => 'ri-file-transfer-line',
                        'Ecommerce' => 'ri-shopping-bag-3-line',
                        'Mercado Livre' => 'ri-store-line',
                        'Woocommerce' => 'ri-shopping-cart-2-line',
                        'Nuvem Shop' => 'ri-cloud-line',
                        'Delivery/Marketplace' => 'ri-motorbike-line',
                        'Localizações' => 'ri-map-pin-line',
                        'Reservas' => 'ri-hotel-bed-line',
                        'IFood' => 'ri-restaurant-2-line',
                        'CRM' => 'ri-customer-service-2-line',
                        'Sped' => 'ri-settings-3-line',
                        'Configuração' => 'ri-settings-4-line',
                        'Fiscal' => 'ri-file-code-line',
                        'Pet Shop' => 'ri-bear-smile-fill',
                    ];
                @endphp

                <ul class="nav nav-pills form-wizard-header mb-4 m-2 role-permissions__wizard-tabs" id="role-permissions-tabs" role="tablist">
                    @php $tabIndex = 0; @endphp
                    @foreach($permissionTabsLocal as $moduleName => $resourceGroups)
                        @php
                            $tabIndex++;
                            $tabId = 'perm-tab-' . $tabIndex;
                            $paneId = 'perm-pane-' . $tabIndex;
                            $iconClass = $moduleIcons[$moduleName] ?? 'ri-shield-keyhole-line';
                        @endphp
                        <li class="nav-item" role="presentation">
                            <a
                                class="nav-link rounded-0 py-2 {{ $tabIndex === 1 ? 'active' : '' }}"
                                id="{{ $tabId }}"
                                href="#{{ $paneId }}"
                                data-bs-toggle="tab"
                                role="tab"
                                aria-controls="{{ $paneId }}"
                                aria-selected="{{ $tabIndex === 1 ? 'true' : 'false' }}"
                            >
                                <i class="{{ $iconClass }} fs-18 align-middle"></i>
                                <span class="d-none d-sm-inline">{{ $moduleName }}</span>
                            </a>
                        </li>
                    @endforeach
                </ul>

                <div class="tab-content b-0 mb-0 pt-2" id="role-permissions-tabs-content">
                    @php $tabIndex = 0; @endphp
                    @foreach($permissionTabsLocal as $moduleName => $resourceGroups)
                        @php
                            $tabIndex++;
                            $paneId = 'perm-pane-' . $tabIndex;
                        @endphp
                        <div
                            class="tab-pane {{ $tabIndex === 1 ? 'active show' : '' }}"
                            id="{{ $paneId }}"
                            role="tabpanel"
                            aria-labelledby="perm-tab-{{ $tabIndex }}"
                            tabindex="0"
                        >
                            <div class="d-flex justify-content-end mb-2">
                                <div class="form-check">
                                    <input class="form-check-input role-permissions-toggle-module" type="checkbox" id="toggle-module-{{ $tabIndex }}" data-module-pane="{{ $paneId }}">
                                    <label class="form-check-label" for="toggle-module-{{ $tabIndex }}">
                                        Marcar tudo (aba)
                                    </label>
                                </div>
                            </div>

                            <div class="row g-3">
                                @if(empty($resourceGroups))
                                    <div class="col-12 text-muted">
                                        Nenhuma permissão cadastrada para este módulo.
                                    </div>
                                @endif
                                @foreach($resourceGroups as $resourceName => $permissionList)
                                    @php
                                        $resourceId = 'resource-' . $tabIndex . '-' . md5($resourceName);
                                    @endphp
                                    <div class="col-12 col-lg-6 role-permissions-group" data-group="{{ $resourceName }}">
                                        <div class="card border h-100">
                                            <div class="card-header d-flex justify-content-between align-items-center">
                                                <div class="fw-semibold text-truncate" title="{{ $resourceName }}">{{ $resourceName }}</div>
                                                <div class="form-check m-0">
                                                    <input
                                                        class="form-check-input role-permissions-toggle-group"
                                                        type="checkbox"
                                                        id="toggle-{{ $resourceId }}"
                                                        data-group="{{ $resourceId }}"
                                                    >
                                                    <label class="form-check-label" for="toggle-{{ $resourceId }}">Tudo</label>
                                                </div>
                                            </div>
                                            <div class="card-body">
                                                <div class="row">
                                                    @foreach($permissionList as $permission)
                                                        @php
                                                            $checkboxId = 'perm-' . $permission->id;
                                                            $isChecked = in_array((int) $permission->id, $selectedPermissions, true);
                                                        @endphp
                                                        <div class="col-12 col-md-6 mb-2 role-permission-item"
                                                            data-group="{{ $resourceId }}"
                                                            data-search="{{ \Illuminate\Support\Str::lower(($permission->description ?? '') . ' ' . ($permission->name ?? '')) }}"
                                                        >
                                                            <div class="form-check">
                                                                <input
                                                                    class="form-check-input role-permission-checkbox"
                                                                    type="checkbox"
                                                                    name="permissions[]"
                                                                    id="{{ $checkboxId }}"
                                                                    value="{{ $permission->id }}"
                                                                    {{ $isChecked ? 'checked' : '' }}
                                                                >
                                                                <label class="form-check-label" for="{{ $checkboxId }}">
                                                                    {{ $permission->description }}
                                                                </label>
                                                                <div class="text-muted small">{{ $permission->name }}</div>
                                                            </div>
                                                        </div>
                                                    @endforeach
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                            </div>

                            <div class="text-muted mt-3 role-permissions-empty d-none">
                                Nenhuma permissão encontrada nesta aba.
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>

        <div class="form-text mt-2">
            Selecione ao menos uma permissão para salvar.
        </div>
    </div>

    <hr class="mt-4">
    <div class="col-12" style="text-align: right;">
        <button type="submit" class="btn btn-success px-5" id="btn-store">Salvar</button>
    </div>
</div>

<script>
    (function () {
        const searchInput = document.getElementById('role-permissions-search');
        const toggleAllVisible = document.getElementById('role-permissions-check-all-visible');

        const permissionItems = Array.from(document.querySelectorAll('.role-permission-item'));
        const permissionCheckboxes = Array.from(document.querySelectorAll('.role-permission-checkbox'));
        const moduleToggles = Array.from(document.querySelectorAll('.role-permissions-toggle-module'));
        const groupToggles = Array.from(document.querySelectorAll('.role-permissions-toggle-group'));

        function isVisible(element) {
            return element && element.offsetParent !== null;
        }

        function filterPermissions() {
            const query = (searchInput?.value || '').trim().toLowerCase();
            permissionItems.forEach((item) => {
                const haystack = item.getAttribute('data-search') || '';
                const matches = !query || haystack.includes(query);
                item.classList.toggle('d-none', !matches);
            });

            document.querySelectorAll('.tab-pane').forEach((pane) => {
                const items = Array.from(pane.querySelectorAll('.role-permission-item'));
                const anyVisible = items.some((item) => !item.classList.contains('d-none'));
                const emptyState = pane.querySelector('.role-permissions-empty');
                if (emptyState) {
                    emptyState.classList.toggle('d-none', anyVisible);
                }
            });
        }

        function setCheckedForVisible(checked) {
            permissionCheckboxes.forEach((checkbox) => {
                const wrapper = checkbox.closest('.role-permission-item');
                if (!wrapper || wrapper.classList.contains('d-none')) {
                    return;
                }
                if (!isVisible(wrapper)) {
                    return;
                }
                checkbox.checked = checked;
            });
        }

        searchInput?.addEventListener('input', filterPermissions);
        toggleAllVisible?.addEventListener('change', (event) => {
            setCheckedForVisible(event.target.checked);
        });

        moduleToggles.forEach((toggle) => {
            toggle.addEventListener('change', (event) => {
                const paneId = event.target.getAttribute('data-module-pane');
                const pane = paneId ? document.getElementById(paneId) : null;
                if (!pane) return;
                const checkboxes = Array.from(pane.querySelectorAll('.role-permission-checkbox'));
                checkboxes.forEach((checkbox) => {
                    const wrapper = checkbox.closest('.role-permission-item');
                    if (!wrapper || wrapper.classList.contains('d-none')) return;
                    checkbox.checked = event.target.checked;
                });
            });
        });

        groupToggles.forEach((toggle) => {
            toggle.addEventListener('change', (event) => {
                const group = event.target.getAttribute('data-group');
                const checkboxes = Array.from(document.querySelectorAll(`.role-permission-item[data-group="${group}"] .role-permission-checkbox`));
                checkboxes.forEach((checkbox) => {
                    const wrapper = checkbox.closest('.role-permission-item');
                    if (!wrapper || wrapper.classList.contains('d-none')) return;
                    checkbox.checked = event.target.checked;
                });
            });
        });

        filterPermissions();
    })();
</script>
