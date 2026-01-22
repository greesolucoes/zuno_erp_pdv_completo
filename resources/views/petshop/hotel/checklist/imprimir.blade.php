<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <title>Checklist - Hotel</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        .muted { color: #666; }
        .box { border: 1px solid #ddd; padding: 12px; border-radius: 6px; }
    </style>
</head>
<body>
    <h2>Checklist - Hotel</h2>
    <div class="box">
        <div class="muted">View em construção: <strong>petshop.hotel.checklist.imprimir</strong></div>
        <hr>
        <div><strong>Animal:</strong> {{ $animal->nome ?? '-' }}</div>
        <div><strong>Empresa:</strong> {{ $config->nome ?? '-' }}</div>
    </div>
</body>
</html>

