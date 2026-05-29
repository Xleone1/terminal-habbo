<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\InventoryItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'username' => 'AdminMaster',
            'password' => Hash::make('admin'),
            'role' => 'admin',
        ]);

        // Create regular users
        $users = User::factory(15)->create([
            'role' => 'user',
        ]);

        // Add some inventory items to users
        foreach ($users->concat([$admin]) as $user) {
            $itemIds = [1, 2, 3, 4, 5];
            foreach ($itemIds as $itemId) {
                InventoryItem::create([
                    'user_id' => $user->id,
                    'item_id' => $itemId,
                    'quantity' => random_int(1, 5),
                ]);
            }
        }
    }
}
