<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Senha com Primeiro Ponto Colorido</title>
  <style>
    body {
      text-align: center;
      font-family: sans-serif;
      margin-top: 30px;
    }
    canvas {
      border: 1px solid #ccc;
      touch-action: none;
    }
    #reset {
      margin-top: 20px;
      padding: 10px 16px;
      font-size: 16px;
    }
  </style>
</head>
<body>

<h2>Desenhe sua senha</h2>
<canvas id="canvas" width="300" height="300"></canvas>
<br>
<button id="reset">Limpar</button>

<script>
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const radius = 20;
  const points = [];
  const selected = [];
  let isDrawing = false;

  // Cria 9 pontos (3x3)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const x = 50 + col * 100;
      const y = 50 + row * 100;
      points.push({ x, y, index: row * 3 + col + 1 });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Linhas entre pontos selecionados
    if (selected.length > 1) {
      ctx.beginPath();
      const first = points.find(p => p.index === selected[0]);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < selected.length; i++) {
        const pt = points.find(p => p.index === selected[i]);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = "#4CAF50";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Desenho dos pontos
    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);

      if (p.index === selected[0]) {
        ctx.fillStyle = "#007BFF"; // Primeiro ponto azul
      } else if (selected.includes(p.index)) {
        ctx.fillStyle = "#4CAF50"; // Demais pontos verdes
      } else {
        ctx.fillStyle = "#ccc";
      }

      ctx.fill();
      ctx.strokeStyle = "#999";
      ctx.stroke();
    }
  }

  function getPointAt(x, y) {
    return points.find(p => Math.hypot(p.x - x, p.y - y) <= radius + 5);
  }

  canvas.addEventListener("pointerdown", (e) => {
    isDrawing = true;
    selected.length = 0;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const p = getPointAt(x, y);
    if (p && !selected.includes(p.index)) {
      selected.push(p.index);
      draw();
    }
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const p = getPointAt(x, y);
    if (p && !selected.includes(p.index)) {
      selected.push(p.index);
      draw();
    }
  });

  canvas.addEventListener("pointerup", () => {
    isDrawing = false;
    console.log("Sequência desenhada:", selected.join('-'));
  });

  document.getElementById("reset").addEventListener("click", () => {
    selected.length = 0;
    draw();
  });

  draw();

  const padraoSalvo = "1-2-5-9";
  const sequencia = padraoSalvo.split('-').map(Number);

  function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha os pontos
    for (let p of points) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);

      if (p.index === sequencia[0]) {
        ctx.fillStyle = '#FFA500'; // Primeiro ponto: laranja
      } else if (sequencia.includes(p.index)) {
        ctx.fillStyle = '#4CAF50'; // Demais pontos da sequência: verde
      } else {
        ctx.fillStyle = '#ddd'; // Ponto inativo
      }

      ctx.fill();
      ctx.strokeStyle = '#999';
      ctx.stroke();
    }

    // Desenha linhas entre pontos da sequência
    if (sequencia.length > 1) {
      ctx.beginPath();
      const first = points.find(p => p.index === sequencia[0]);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < sequencia.length; i++) {
        const p = points.find(pt => pt.index === sequencia[i]);
        ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  desenhar();
</script>

</body>
</html>
