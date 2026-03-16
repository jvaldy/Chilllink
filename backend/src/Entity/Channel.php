<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\ChannelRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ChannelRepository::class)]
class Channel
{
    // Identifiant technique
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['channel:list', 'channel:item', 'workspace:item', 'message:list'])]
    private ?int $id = null;

    // Nom du canal
    #[ORM\Column(length: 255)]
    #[Groups(['channel:list', 'channel:item', 'workspace:item', 'message:list'])]
    private string $name;

    // Workspace parent
    #[ORM\ManyToOne(targetEntity: Workspace::class, inversedBy: 'channels')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['channel:item'])]
    private Workspace $workspace;

    // Membres du canal
    #[ORM\ManyToMany(targetEntity: User::class)]
    #[ORM\JoinTable(name: 'channel_user')]
    #[Groups(['channel:item'])]
    private Collection $members;

    // Messages du canal
    #[ORM\OneToMany(mappedBy: 'channel', targetEntity: Message::class)]
    #[Groups(['channel:item'])]
    private Collection $messages;

    // Date de création
    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['channel:item'])]
    private \DateTimeImmutable $createdAt;

    // Initialise les collections et la date
    public function __construct()
    {
        $this->members = new ArrayCollection();
        $this->messages = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
    }

    // Identifiant interne
    public function getId(): ?int { return $this->id; }

    // Nom du canal
    public function getName(): string { return $this->name; }
    public function setName(string $name): self { $this->name = $name; return $this; }

    // Workspace parent
    public function getWorkspace(): Workspace { return $this->workspace; }
    public function setWorkspace(Workspace $workspace): self { $this->workspace = $workspace; return $this; }

    // Membres
    public function getMembers(): Collection { return $this->members; }

    // Messages
    public function getMessages(): Collection { return $this->messages; }

    // Date de création
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }

    // Vérifie si l'utilisateur est membre
    public function isMember(User $user): bool
    {
        return $this->members->contains($user);
    }

    // Ajoute un membre si absent
    public function addMember(User $user): self
    {
        if (!$this->members->contains($user)) {
            $this->members->add($user);
        }
        return $this;
    }

    // Retire un membre
    public function removeMember(User $user): self
    {
        $this->members->removeElement($user);
        return $this;
    }
}
