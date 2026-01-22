<?php

namespace App\Services\Petshop\Vet;

use App\Models\Petshop\Animal;

class HistoricoMedicoPacienteService
{
    /**
     * Monta um resumo básico do histórico médico do paciente.
     * 
     * @return array{
     *   selectedYear:int,
     *   availableYears:array<int,int>,
     *   timeline:array<int,mixed>,
     *   stats:array<string,int>,
     *   hasEvents:bool
     * }
     */
    public function build(int $empresaId, Animal $animal, int $year): array
    {
        return [
            'selectedYear' => $year,
            'availableYears' => [$year],
            'timeline' => [],
            'stats' => [
                'consultas' => 0,
                'atendimentos' => 0,
                'vacinacoes' => 0,
                'internacoes' => 0,
            ],
            'hasEvents' => false,
        ];
    }
}

