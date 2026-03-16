<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    // Identifiant technique
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['workspace:item', 'message:item', 'channel:item'])]
    private ?int $id = null;

    // Email unique de l'utilisateur
    #[ORM\Column(type: 'string', length: 180, unique: true)]
    #[Assert\NotBlank(message: 'Email is required')]
    #[Assert\Email(message: 'Invalid email format')]
    #[Groups(['workspace:item', 'message:item', 'channel:item'])]
    private ?string $email = null;

    /**
     * @var array<string>
     */
    // Rôles applicatifs
    #[ORM\Column(type: 'json')]
    private array $roles = [];

    // Mot de passe hashé
    #[ORM\Column(type: 'string')]
    #[Assert\NotBlank(message: 'Password is required')]
    private ?string $password = null;

    // Dates d'audit
    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updatedAt;

    // Profil utilisateur (1-1)
    #[ORM\OneToOne(mappedBy: 'user', targetEntity: UserProfile::class, cascade: ['persist', 'remove'])]
    private ?UserProfile $profile = null;

    // Initialise les dates d'audit
    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    // Identifiant interne
    public function getId(): ?int
    {
        return $this->id;
    }

    // Email de connexion
    public function getEmail(): ?string
    {
        return $this->email;
    }

    // Met à jour l'email
    public function setEmail(string $email): static
    {
        $this->email = $email;
        $this->updatedAt = new \DateTimeImmutable();
        return $this;
    }

    // Identifiant de connexion (email)
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    // Rôles (ROLE_USER ajouté par défaut)
    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';

        return array_values(array_unique($roles));
    }

    /**
     * @param array<string> $roles
     */
    // Définit les rôles
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
        $this->updatedAt = new \DateTimeImmutable();
        return $this;
    }

    // Mot de passe hashé
    public function getPassword(): string
    {
        return (string) $this->password;
    }

    // Met à jour le mot de passe
    public function setPassword(string $password): static
    {
        $this->password = $password;
        $this->updatedAt = new \DateTimeImmutable();
        return $this;
    }

    // Nettoie les données sensibles temporaires
    public function eraseCredentials(): void
    {
        // Si un plainPassword existe, le vider ici
    }

    // Date de création
    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    // Date de dernière mise à jour
    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }

    // Profil associé
    public function getProfile(): ?UserProfile
    {
        return $this->profile;
    }

    // Associe un profil
    public function setProfile(UserProfile $profile): self
    {
        $this->profile = $profile;
        return $this;
    }
}
