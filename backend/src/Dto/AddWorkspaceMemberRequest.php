<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

final class AddWorkspaceMemberRequest
{
    #[Assert\NotBlank(message: 'Une adresse e-mail est requise.')]
    #[Assert\Email(message: "Format d'adresse e-mail invalide")]
    public string $email;
}
