<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\User;
use App\UserRole;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            $this->command->warn('Os eventos de demonstração só podem ser criados em local ou testing.');

            return;
        }

        $organizer = User::query()->where('role', UserRole::Organizer)->first();

        if ($organizer === null) {
            $this->command->warn('Crie uma conta organizadora antes de executar este seeder.');

            return;
        }

        Event::factory()->for($organizer)->count(2)->create();
    }
}
