<?php

namespace App\Entity;

use App\Repository\WorkspaceRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: WorkspaceRepository::class)]
class Workspace
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['workspace:list', 'workspace:item', 'channel:item'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['workspace:list', 'workspace:item', 'channel:item'])]
    private string $name;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['workspace:item'])]
    private User $owner;

    #[ORM\OneToMany(mappedBy: 'workspace', targetEntity: Channel::class)]
    #[Groups(['workspace:item'])]
    private Collection $channels;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['workspace:item'])]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->channels = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getName(): string { return $this->name; }
    public function setName(string $name): self { $this->name = $name; return $this; }

    public function getOwner(): User { return $this->owner; }
    public function setOwner(User $owner): self { $this->owner = $owner; return $this; }

    public function getChannels(): Collection { return $this->channels; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
}
