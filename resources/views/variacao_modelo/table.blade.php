@if(isset($sub) && $sub != null)

@foreach($item->itens as $key1 => $i)
@foreach($sub->itens as $key2 => $s)
<tr class="dynamic-form">
	<input type="hidden" class="form-control" name="variacao_modelo_item_id[]" value="{{ $i->id }}" required readonly>
	<td style="width: 300px">

		<input type="text" class="form-control" name="descricao_variacao[]" value="{{ $i->nome }} {{ $s->nome }}" required readonly>
	</td>
	<td>
		<input type="tel" class="form-control moeda" name="valor_venda_variacao[]" value="" required>
	</td>

	<td>

		<div class="input-group input-group-merge">
			<input type="tel" name="codigo_barras_variacao[]" class="form-control ignore">
			<div class="input-group-text gerar-codigo">
				<span class="ri-barcode-box-line"></span>
			</div>
		</div>
	</td>
	<td>
		<input type="text" class="form-control ignore" name="referencia_variacao[]" value="">
	</td>
	<td>
		<input type="text" class="form-control ignore qtd" name="estoque_variacao[]" value="">
	</td>
	<td>
		<input class="ignore" accept="image/*" type="file" class="form-control" name="imagem_variacao[]" value="">
	</td>
	<td>
		<button type="button" class="btn btn-sm btn-danger btn-remove-tr-variacao">
			<i class="ri-subtract-line"></i>
		</button>
	</td>
</tr>
@endforeach
@endforeach

@else
@foreach($item->itens as $i)
<tr class="dynamic-form">
	<td>
		<input type="hidden" class="form-control" name="variacao_modelo_item_id[]" value="{{ $i->id }}" required readonly>
		<input type="text" class="form-control" name="descricao_variacao[]" value="{{ $i->nome }}" required readonly>
	</td>
	<td>
		<input type="tel" class="form-control moeda" name="valor_venda_variacao[]" value="">
	</td>

	<td>

		<div class="input-group input-group-merge">
			<input type="tel" name="codigo_barras_variacao[]" class="form-control ignore">
			<div class="input-group-text gerar-codigo">
				<span class="ri-barcode-box-line"></span>
			</div>
		</div>
	</td>
	<td>
		<input type="text" class="form-control ignore" name="referencia_variacao[]" value="">
	</td>
	<td>
		<input type="text" class="form-control ignore qtd" name="estoque_variacao[]" value="">
	</td>
	<td>
		<input class="ignore" accept="image/*" type="file" class="form-control" name="imagem_variacao[]" value="">
	</td>
	<td>
		<button type="button" class="btn btn-sm btn-danger btn-remove-tr-variacao">
			<i class="ri-subtract-line"></i>
		</button>
	</td>
</tr>
@endforeach
@endif