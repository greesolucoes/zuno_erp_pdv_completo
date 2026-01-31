<?php

declare(strict_types=1);

namespace App\Support\Petshop\Vet;

class PrescriptionModelOptions
{
    public const STATUS_ACTIVE = 'ativo';
    public const STATUS_INACTIVE = 'inativo';

    /**
     * @return array<string, string>
     */
    public static function categories(): array
    {
        return [
            'geral' => 'Geral',
            'consulta' => 'Consulta',
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
        return [self::STATUS_ACTIVE, self::STATUS_INACTIVE];
    }

    /**
     * @return array<string, string>
     */
    public static function statusOptions(): array
    {
        return [
            self::STATUS_ACTIVE => 'Ativo',
            self::STATUS_INACTIVE => 'Inativo',
        ];
    }

    public static function categoryLabel(?string $category): ?string
    {
        if (! is_string($category)) return null;
        $trimmed = trim($category);
        if ($trimmed === '') return null;

        $categories = self::categories();
        if (array_key_exists($trimmed, $categories)) return $categories[$trimmed];

        return $trimmed;
    }

    /**
     * @return array<int, string>
     */
    public static function fieldTypes(): array
    {
        return [
            'texto_curto',
            'texto_longo',
            'numero_decimal',
            'inteiro',
            'data',
            'hora',
            'data_hora',
            'select',
            'multi_select',
            'checkbox',
            'checkbox_group',
            'radio_group',
            'email',
            'phone',
            'file',
            'rich_text',
        ];
    }

    public static function fieldTypeLabel(string $type): string
    {
        return match ($type) {
            'texto_curto' => 'Texto curto',
            'texto_longo' => 'Texto longo',
            'numero_decimal' => 'Número decimal',
            'inteiro' => 'Inteiro',
            'data' => 'Data',
            'hora' => 'Hora',
            'data_hora' => 'Data e hora',
            'select' => 'Select',
            'multi_select' => 'Multi-select',
            'checkbox' => 'Checkbox',
            'checkbox_group' => 'Grupo de checkbox',
            'radio_group' => 'Grupo de rádio',
            'email' => 'E-mail',
            'phone' => 'Telefone',
            'file' => 'Arquivo',
            'rich_text' => 'Rich text',
            default => $type,
        };
    }

    /**
     * @return array<int, string>
     */
    public static function configKeysForType(string $type): array
    {
        $common = ['placeholder'];

        return match ($type) {
            'texto_curto' => $common,
            'texto_longo' => ['textarea_placeholder'],
            'numero_decimal' => array_merge($common, ['number_min', 'number_max']),
            'inteiro' => array_merge($common, ['integer_min', 'integer_max']),
            'data' => array_merge($common, ['date_hint']),
            'hora' => array_merge($common, ['time_hint']),
            'data_hora' => array_merge($common, ['datetime_hint']),
            'select' => array_merge($common, ['select_options']),
            'multi_select' => array_merge($common, ['multi_select_options']),
            'checkbox' => ['checkbox_label_checked', 'checkbox_label_unchecked', 'checkbox_default'],
            'checkbox_group' => array_merge($common, ['checkbox_group_options']),
            'radio_group' => array_merge($common, ['radio_group_options', 'radio_group_default']),
            'email' => array_merge($common, ['email_placeholder']),
            'phone' => array_merge($common, ['phone_placeholder']),
            'file' => ['file_types', 'file_max_size'],
            'rich_text' => ['rich_text_default'],
            default => [],
        };
    }

    public static function configLabel(string $key, string $type): string
    {
        return match ($key) {
            'placeholder' => 'Placeholder',
            'textarea_placeholder' => 'Placeholder (textarea)',
            'number_min' => 'Mínimo',
            'number_max' => 'Máximo',
            'integer_min' => 'Mínimo',
            'integer_max' => 'Máximo',
            'date_hint' => 'Dica (data)',
            'time_hint' => 'Dica (hora)',
            'datetime_hint' => 'Dica (data/hora)',
            'select_options' => 'Opções',
            'multi_select_options' => 'Opções',
            'checkbox_label_checked' => 'Label (marcado)',
            'checkbox_label_unchecked' => 'Label (desmarcado)',
            'checkbox_default' => 'Default',
            'checkbox_group_options' => 'Opções',
            'radio_group_options' => 'Opções',
            'radio_group_default' => 'Padrão',
            'email_placeholder' => 'Placeholder (e-mail)',
            'phone_placeholder' => 'Placeholder (telefone)',
            'file_types' => 'Tipos',
            'file_max_size' => 'Tamanho máx.',
            'rich_text_default' => 'Padrão',
            default => $key,
        };
    }
}

