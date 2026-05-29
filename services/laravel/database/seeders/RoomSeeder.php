<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rooms = [
            [
                'name' => 'Recepción Principal',
                'description' => 'El lugar de encuentro principal del hotel',
                'capacity' => 100,
                'current_users' => random_int(10, 50),
                'is_public' => true,
            ],
            [
                'name' => 'Sala de Conciertos',
                'description' => 'Disfruta de música en vivo',
                'capacity' => 150,
                'current_users' => random_int(20, 80),
                'is_public' => true,
            ],
            [
                'name' => 'Piscina del Hotel',
                'description' => 'Relájate en la piscina',
                'capacity' => 120,
                'current_users' => random_int(15, 60),
                'is_public' => true,
            ],
            [
                'name' => 'Cafetería Moderna',
                'description' => 'Toma algo en nuestra cafetería',
                'capacity' => 80,
                'current_users' => random_int(5, 40),
                'is_public' => true,
            ],
            [
                'name' => 'Sala de Juegos',
                'description' => 'Juega con otros usuarios',
                'capacity' => 90,
                'current_users' => random_int(10, 50),
                'is_public' => true,
            ],
            [
                'name' => 'Biblioteca',
                'description' => 'Un lugar tranquilo para leer',
                'capacity' => 50,
                'current_users' => random_int(2, 20),
                'is_public' => true,
            ],
            [
                'name' => 'Discoteca Retro',
                'description' => 'Baila al ritmo de la música retro',
                'capacity' => 200,
                'current_users' => random_int(50, 150),
                'is_public' => true,
            ],
            [
                'name' => 'Jardín Secreto',
                'description' => 'Un hermoso jardín escondido',
                'capacity' => 60,
                'current_users' => random_int(5, 30),
                'is_public' => true,
            ],
        ];

        foreach ($rooms as $room) {
            Room::create($room);
        }
    }
}
