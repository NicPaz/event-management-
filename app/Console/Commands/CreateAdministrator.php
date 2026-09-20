<?php

namespace App\Console\Commands;

use App\Models\User;
use App\UserRole;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

#[Signature('celebra:create-admin {--name=} {--email=}')]
#[Description('Cria uma conta administradora sem gravar credenciais no código')]
class CreateAdministrator extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $name = (string) ($this->option('name') ?: $this->ask('Nome'));
        $email = Str::lower(trim((string) ($this->option('email') ?: $this->ask('E-mail'))));
        $password = (string) $this->secret('Senha');
        $passwordConfirmation = (string) $this->secret('Confirme a senha');

        $validator = Validator::make([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'password_confirmation' => $passwordConfirmation,
        ], [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        if ($validator->fails()) {
            $this->components->error($validator->errors()->first());

            return self::FAILURE;
        }

        $validated = $validator->validated();

        $user = new User([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ]);
        $user->role = UserRole::Administrator;
        $user->save();

        $this->components->info('Conta administradora criada.');

        return self::SUCCESS;
    }
}
