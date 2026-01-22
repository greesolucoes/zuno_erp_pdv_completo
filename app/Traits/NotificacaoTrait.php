<?php

namespace App\Traits;

use App\Models\Notificacao;

trait NotificacaoTrait
{
    private function criaNotificacao($tabela, $referencia, $empresa, $titulo, $descricaoCurta, $objeto, $prioridade = 'baixa')
    {
        $item = Notificacao::where('empresa_id', $empresa->id)
            ->where('tabela', $tabela)
            ->where('referencia', $referencia)
            ->where('titulo', $titulo)
            ->first();

        if ($item == null) {
            $descricao = $this->getDescricao($tabela, $objeto);
            Notificacao::create([
                'empresa_id' => $empresa->id,
                'tabela' => $tabela,
                'descricao' => $descricao,
                'descricao_curta' => $descricaoCurta,
                'referencia' => $referencia,
                'status' => 1,
                'por_sistema' => 1,
                'prioridade' => $prioridade,
                'visualizada' => 0,
                'titulo' => $titulo,
            ]);
        }
    }

    private function getDescricao($tabela, $item)
    {
        if ($tabela == 'conta_recebers') {
            return view('notificacao.partials.conta_receber', compact('item'));
        }
        if ($tabela == 'conta_pagars') {
            return view('notificacao.partials.conta_pagar', compact('item'));
        }
        if ($tabela == 'compras') {
            return view('notificacao.partials.compras', compact('item'));
        }
        if ($tabela == 'estoques') {
            return view('notificacao.partials.estoques', compact('item'));
        }
        if ($tabela == 'ordem_servicos') {
            return view('notificacao.partials.ordem_servico', compact('item'));
        }
        if ($tabela == 'nfces') {
            return view('notificacao.partials.venda_pdv', compact('item'));
        }
        if ($tabela == 'certificados') {
            return view('notificacao.partials.certificado', compact('item'));
        }
        if ($tabela == 'esteticas') {
            return view('notificacao.partials.estetica', compact('item'));
        }
         if ($tabela == 'hoteis') {
            return view('notificacao.partials.hotel', compact('item'));
        }
        if ($tabela == 'creches') {
            return view('notificacao.partials.creche', compact('item'));
        }
    }
}