<?php

namespace Database\Seeders;

use App\Models\Item;
use Illuminate\Database\Seeder;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            [
                'name' => 'Sofá Rojo',
                'description' => 'Un cómodo sofá rojo para tu habitación',
                'type' => 'furniture',
                'price' => 100,
            ],
            [
                'name' => 'Lámpara de Neon',
                'description' => 'Una lámpara de neón que brilla en la oscuridad',
                'type' => 'furniture',
                'price' => 150,
            ],
            [
                'name' => 'Espejo Decorativo',
                'description' => 'Un hermoso espejo para decorar tus paredes',
                'type' => 'furniture',
                'price' => 80,
            ],
            [
                'name' => 'Cuadro Abstracto',
                'description' => 'Cuadro de arte abstracto moderno',
                'type' => 'furniture',
                'price' => 120,
            ],
            [
                'name' => 'Planta Verde',
                'description' => 'Una planta verde para añadir vida a tu habitación',
                'type' => 'furniture',
                'price' => 60,
            ],
        ];

        foreach ($items as $item) {
            Item::create($item);
        }
    }
}
