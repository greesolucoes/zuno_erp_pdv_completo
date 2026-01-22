@extends('layouts.app', ['title' => 'Mesas'])
@section('content')
<div class="mt-3">
    <div class="row">
        <div class="card">
            <div class="card-body">
                <div class="col-md-12">
                    @can('mesa_create')
                    <a href="{{ route('mesas.create') }}" class="btn btn-success">
                        <i class="ri-add-circle-fill"></i>
                        Nova Mesa
                    </a>
                    @endcan
                </div>
                <hr class="mt-3">
                <div class="col-md-12 mt-3 table-responsive">
                    <div class="table-responsive-sm">
                        <table class="table table-striped table-centered mb-0">
                            <thead class="table-dark">
                                <tr>

                                    <th>Nome</th>
                                    <th>Status</th>
                                    <th>Ocupada</th>
                                    <th>Link</th>
                                    
                                    <th width="10%">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($data as $item)
                                <tr>

                                    <td>{{ $item->nome }}</td>

                                    <td>
                                        @if($item->status)
                                        <i class="ri-checkbox-circle-fill text-success"></i>
                                        @else
                                        <i class="ri-close-circle-fill text-danger"></i>
                                        @endif
                                    </td>
                                     <td>
                                        @if($item->ocupada)
                                        <i class="ri-checkbox-circle-fill text-success"></i>
                                        @else
                                        <i class="ri-close-circle-fill text-danger"></i>
                                        @endif
                                    </td>
                                    <td>{{ env("APP_URL") }}/cardapio?link={{ $item->hash }}</td>
                                    <td>
                                        <form action="{{ route('mesas.destroy', $item->id) }}" method="post" id="form-{{$item->id}}">
                                            @method('delete')
                                            @can('mesa_edit')
                                            <a class="btn btn-warning btn-sm" href="{{ route('mesas.edit', [$item->id]) }}">
                                                <i class="ri-pencil-fill"></i>
                                            </a>
                                            @endcan
                                            @csrf
                                            @can('mesa_delete')
                                            <button type="button" class="btn btn-delete btn-sm btn-danger">
                                                <i class="ri-delete-bin-line"></i>
                                            </button>

                                            @endcan

                                            @if(env("CARDAPIO_QRCODE") == 1)
                                            <a target="_blank" class="btn btn-dark btn-sm" href="{{ route('mesas.qr-code', [$item->id]) }}">
                                                <i class="ri-qr-code-fill"></i>
                                            </a>
                                            @endif
                                        </form>
                                    </td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="5" class="text-center">Nada encontrado</td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                        <br>
                        
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

