<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <title>Cupom de Entrega - Creche</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        .muted { color: #666; }
        .box { border: 1px solid #ddd; padding: 12px; border-radius: 6px; }
    </style>
</head>
<body>
    <h2>Cupom de Entrega - Creche</h2>
    <div class="box">
        <div class="muted">View em construção: <strong>petshop.creche.cupom_entrega</strong></div>
        <hr>
        <div><strong>Reserva:</strong> {{ $creche->id ?? '-' }}</div>
        <div><strong>Animal:</strong> {{ $creche->animal->nome ?? '-' }}</div>
        <div><strong>Cliente:</strong> {{ $creche->cliente->razao_social ?? ($creche->cliente->nome_fantasia ?? '-') }}</div>
        <div><strong>Empresa:</strong> {{ $config->nome ?? '-' }}</div>
    </div>
</body>
</html>

