<?php

namespace Database\Seeders;

use App\Actions\Gifts\ReserveGift;
use App\Actions\Guests\NormalizeGuestIdentity;
use App\EventStatus;
use App\EventType;
use App\Models\Event;
use App\Models\EventGuest;
use App\Models\User;
use App\RsvpStatus;
use App\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

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

        $organizers = User::query()->where('role', UserRole::Organizer)->get();

        if ($organizers->isEmpty()) {
            $this->command->warn('Crie uma conta organizadora antes de executar este seeder.');

            return;
        }

        $createdEvents = 0;

        foreach ($organizers as $organizer) {
            $createdEvents += $this->seedOrganizer($organizer) ? 1 : 0;
        }

        $this->command->info("{$createdEvents} evento(s) de demonstração criado(s); existentes foram preservados.");
    }

    private function seedOrganizer(User $organizer): bool
    {
        $slug = "demonstracao-{$organizer->id}";

        if (Event::query()->where('slug', $slug)->exists()) {
            return false;
        }

        DB::transaction(function () use ($organizer, $slug): void {
            $event = Event::factory()->for($organizer)->create([
                'title' => 'Celebração de demonstração',
                'type' => EventType::Housewarming,
                'slug' => $slug,
                'starts_at' => now()->addDays(45)->setTime(18, 30),
                'timezone' => 'America/Sao_Paulo',
                'venue_name' => 'Casa da família Celebra',
                'address' => 'Avenida Paulista, 1000 — São Paulo, SP',
                'welcome_text' => 'Criamos este evento fictício para você conhecer todos os recursos do Celebra.',
                'instructions' => 'Edite ou arquive este evento quando terminar a demonstração.',
                'status' => EventStatus::Published,
                'rsvp_open' => true,
                'reservations_open' => true,
                'published_at' => now(),
            ]);

            $event->theme()->create([
                'background_color' => '#FFF8F0',
                'surface_color' => '#FFFFFF',
                'text_color' => '#3D3028',
                'accent_color' => '#9A5D44',
                'border_color' => '#E7D1C4',
            ]);
            $event->paletteItems()->createMany([
                ['label' => 'Terracota', 'color_hex' => '#B66A50', 'position' => 0],
                ['label' => 'Linho natural', 'material' => 'Linho', 'position' => 1],
                ['label' => 'Verde oliva', 'color_hex' => '#6F7654', 'position' => 2],
            ]);

            $coffeeMaker = $event->gifts()->create([
                'name' => 'Cafeteira',
                'description' => 'Uma cafeteira elétrica para a casa nova.',
                'purchase_url' => 'https://example.com/cafeteira',
                'quantity_total' => 3,
                'position' => 0,
            ]);
            $event->gifts()->create([
                'name' => 'Jogo de toalhas',
                'description' => 'Conjunto de banho em tons neutros.',
                'purchase_url' => 'https://example.com/toalhas',
                'quantity_total' => 2,
                'position' => 1,
            ]);
            $event->gifts()->create([
                'name' => 'Vale-jantar',
                'description' => 'Uma sugestão simbólica para celebrar a casa nova.',
                'purchase_url' => 'https://example.com/jantar',
                'quantity_total' => 1,
                'position' => 2,
            ]);

            $confirmedGuest = $this->createGuest($event, 'Marina Alves', '5511911111111', RsvpStatus::Confirmed, 1);
            $this->createGuest($event, 'Carlos Lima', '5511922222222', RsvpStatus::Declined);
            $this->createGuest($event, 'Joana Costa', '5511933333333', RsvpStatus::Unanswered);

            app(ReserveGift::class)->handle($confirmedGuest, $coffeeMaker, 1);
        });

        return true;
    }

    private function createGuest(
        Event $event,
        string $name,
        string $phone,
        RsvpStatus $status,
        int $companionsCount = 0,
    ): EventGuest {
        $normalizer = app(NormalizeGuestIdentity::class);

        return $event->guests()->create([
            'name' => $name,
            'name_normalized' => $normalizer->name($name),
            'phone_normalized' => $phone,
            'rsvp_status' => $status,
            'companions_count' => $status === RsvpStatus::Confirmed ? $companionsCount : 0,
            'confirmed_at' => $status === RsvpStatus::Confirmed ? now() : null,
            'cancelled_at' => $status === RsvpStatus::Declined ? now() : null,
        ]);
    }
}
