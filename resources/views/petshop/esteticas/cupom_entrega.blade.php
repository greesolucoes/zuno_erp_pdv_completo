<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <title>Cupom de Entrega - Estética</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        .muted { color: #666; }
        .box { border: 1px solid #ddd; padding: 12px; border-radius: 6px; }
    </style>
</head>
<body>
    <h2>Cupom de Entrega - Estética</h2>
    <div class="box">
        <div class="muted">View em construção: <strong>petshop.esteticas.cupom_entrega</strong></div>
        <hr>
        <div><strong>Agendamento:</strong> {{ $estetica->id ?? '-' }}</div>
        <div><strong>Animal:</strong> {{ $estetica->animal->nome ?? '-' }}</div>
        <div><strong>Cliente:</strong> {{ $estetica->cliente->razao_social ?? ($estetica->cliente->nome_fantasia ?? '-') }}</div>
        <div><strong>Empresa:</strong> {{ $config->nome ?? '-' }}</div>
    </div>
</body>
</html>

