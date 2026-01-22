<?php

namespace App\Support\Petshop\Vet;

class ModeloAtendimentoOptions
{
    /**
     * @return array<string, string>
     */
    public static function categories(): array
    {
        return [
            'consulta' => 'Consulta',
            'vacina' => 'Vacina',
            'internacao' => 'Internação',
            'cirurgia' => 'Cirurgia',
            'personalizado' => 'Personalizado',
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function statuses(): array
    {
        return ['ativo', 'inativo'];
    }

    /**
     * @return array<string, string>
     */
    public static function statusOptions(): array
    {
        return [
            'ativo' => 'Ativo',
            'inativo' => 'Inativo',
        ];
    }
}

