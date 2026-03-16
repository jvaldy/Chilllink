<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
class UserProfile
{
    // Identifiant technique
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['profile:read'])]
    private ?int $id = null;

    // Utilisateur propriétaire du profil
    #[ORM\OneToOne(inversedBy: 'profile', targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: "CASCADE", unique: true)]
    private User $user;

    // Prénom
    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['profile:read', 'profile:write'])]
    private ?string $firstName = null;

    // Nom
    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['profile:read', 'profile:write'])]
    private ?string $lastName = null;

    // Date de naissance
    #[ORM\Column(type: 'date', nullable: true)]
    #[Groups(['profile:read', 'profile:write'])]
    private ?\DateTimeInterface $birthDate = null;

    // Téléphone
    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['profile:read', 'profile:write'])]
    private ?string $phoneNumber = null;

    // Ville
    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['profile:read', 'profile:write'])]
    private ?string $city = null;

    // Pays
    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['profile:read', 'profile:write'])]
    private ?string $country = null;

    // Bio
    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['profile:read', 'profile:write'])]
    private ?string $bio = null;

    // Dates d'audit
    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['profile:read'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['profile:read'])]
    private \DateTimeImmutable $updatedAt;

    // Initialise les dates à la création
    #[ORM\PrePersist]
    public function onCreate(): void
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    // Met à jour la date de modification
    #[ORM\PreUpdate]
    public function onUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    // Identifiant interne
    public function getId(): ?int { return $this->id; }

    // Utilisateur lié
    public function getUser(): User { return $this->user; }
    public function setUser(User $user): self { $this->user = $user; return $this; }

    // Prénom
    public function getFirstName(): ?string { return $this->firstName; }
    public function setFirstName(?string $v): self { $this->firstName = $v; return $this; }

    // Nom
    public function getLastName(): ?string { return $this->lastName; }
    public function setLastName(?string $v): self { $this->lastName = $v; return $this; }

    // Date de naissance
    public function getBirthDate(): ?\DateTimeInterface { return $this->birthDate; }
    public function setBirthDate(?\DateTimeInterface $v): self { $this->birthDate = $v; return $this; }

    // Téléphone
    public function getPhoneNumber(): ?string { return $this->phoneNumber; }
    public function setPhoneNumber(?string $v): self { $this->phoneNumber = $v; return $this; }

    // Ville
    public function getCity(): ?string { return $this->city; }
    public function setCity(?string $v): self { $this->city = $v; return $this; }

    // Pays
    public function getCountry(): ?string { return $this->country; }
    public function setCountry(?string $v): self { $this->country = $v; return $this; }

    // Bio
    public function getBio(): ?string { return $this->bio; }
    public function setBio(?string $v): self { $this->bio = $v; return $this; }
}
