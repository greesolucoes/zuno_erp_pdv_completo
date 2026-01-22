<?php

namespace App\Services\Petshop\Vet;

class ModeloAtendimentoService
{
    /**
     * Retorna templates padrão para criação rápida.
     *
     * @return array<int, array{title:string, category:string|null, content:string, notes?:string|null}>
     */
    public function getDefaultTemplates(): array
    {
        return [];
    }
}

