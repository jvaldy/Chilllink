<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\WorkspaceRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: WorkspaceRepository::class)]
class Workspace
{
    // Identifiant technique
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['workspace:list', 'workspace:item', 'channel:item'])]
    private ?int $id = null;

    // Nom du workspace
    #[ORM\Column(length: 255)]
    #[Groups(['workspace:list', 'workspace:item', 'channel:item'])]
    private string $name;

    // Propriétaire du workspace
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['workspace:item'])]
    private User $owner;

    // Canaux du workspace
    #[ORM\OneToMany(mappedBy: 'workspace', targetEntity: Channel::class)]
    #[Groups(['workspace:item'])]
    private Collection $channels;

    // Membres du workspace
    #[ORM\ManyToMany(targetEntity: User::class)]
    #[ORM\JoinTable(name: 'workspace_user')]
    #[Groups(['workspace:item'])]
    private Collection $members;

    // Date de création
    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['workspace:item'])]
    private \DateTimeImmutable $createdAt;

    // Initialise les collections et la date
    public function __construct()
    {
        $this->channels = new ArrayCollection();
        $this->members = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
    }

    // Identifiant interne
    public function getId(): ?int
    {
        return $this->id;
    }

    // Nom du workspace
    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;
        return $this;
    }

    // Propriétaire
    public function getOwner(): User
    {
        return $this->owner;
    }

    public function setOwner(User $owner): self
    {
        $this->owner = $owner;
        return $this;
    }

    // Canaux
    public function getChannels(): Collection
    {
        return $this->channels;
    }

    // Membres
    public function getMembers(): Collection
    {
        return $this->members;
    }

    // Ajoute un membre si absent
    public function addMember(User $user): self
    {
        if (!$this->members->contains($user)) {
            $this->members->add($user);
        }
        return $this;
    }

    // Date de création
    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    // Vérifie si l'utilisateur est membre
    public function isMember(User $user): bool
    {
        return $this->members->contains($user);
    }

    // Retire un membre (sauf le propriétaire)
    public function removeMember(User $user): self
    {
        if ($this->owner === $user) {
            return $this;
        }

        $this->members->removeElement($user);

        return $this;
    }
}
