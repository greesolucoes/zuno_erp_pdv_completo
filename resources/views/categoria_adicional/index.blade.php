@extends('layouts.app', ['title' => 'Categorias de adicional'])
@section('content')
<div class="mt-3">
    <div class="row">
        <div class="card">
            <div class="card-body">
                <div class="col-md-2">

                    <a href="{{ route('categoria-adicional.create') }}" class="btn btn-success">
                        <i class="ri-add-circle-fill"></i>
                        Nova Categoria
                    </a>

                </div>
                <hr class="mt-3">
                
                <div class="col-md-12 mt-3">
                    <div class="table-responsive-sm">
                        <table class="table table-striped table-centered mb-0">
                            <thead class="table-dark">
                                <tr>
                                    
                                    <th>Nome</th>
                                    <th>Mínimo de escolhas</th>
                                    <th>Máximo de escolhas</th>
                                    <th>Status</th>
                                    <th width="10%">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($data as $item)
                                <tr>
                                   
                                    <td>{{ $item->nome }}</td>
                                    <td>{{ $item->minimo_escolha }}</td>
                                    <td>{{ $item->maximo_escolha }}</td>
                                    <td>
                                        @if($item->status)
                                        <i class="ri-checkbox-circle-fill text-success"></i>
                                        @else
                                        <i class="ri-close-circle-fill text-danger"></i>
                                        @endif
                                    </td>
                                    <td>
                                        <form action="{{ route('categoria-adicional.destroy', $item->id) }}" method="post" id="form-{{$item->id}}">
                                            @method('delete')
                                            @csrf

                                            <a class="btn btn-warning btn-sm text-white" href="{{ route('categoria-adicional.edit', [$item->id]) }}">
                                                <i class="ri-pencil-fill"></i>
                                            </a>
                                            <button type="button" class="btn btn-delete btn-sm btn-danger">
                                                <i class="ri-delete-bin-line"></i>
                                            </button>

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
                {!! $data->appends(request()->all())->links() !!}
            </div>
        </div>
    </div>
</div>
@endsection
