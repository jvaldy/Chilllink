<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

final class RegisterUserRequest
{
    public function __construct(
        #[Assert\NotBlank(message: 'Email is required.')]
        #[Assert\Email(message: 'Invalid email format.')]
        public readonly string $email,
        #[Assert\NotBlank(message: 'Password is required.')]
        public readonly string $password,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            (string) ($data['email'] ?? ''),
            (string) ($data['password'] ?? '')
        );
    }
}
