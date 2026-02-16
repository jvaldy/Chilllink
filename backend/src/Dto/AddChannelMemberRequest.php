<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

final class AddChannelMemberRequest
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Email]
        public readonly string $email,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self((string) ($data['email'] ?? ''));
    }
}
