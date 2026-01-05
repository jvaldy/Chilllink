<?php

namespace App\Entity;

use App\Repository\ChannelRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ChannelRepository::class)]
class Channel
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['channel:item', 'workspace:item', 'message:item'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['channel:item', 'workspace:item'])]
    private string $name;

    #[ORM\ManyToOne(targetEntity: Workspace::class, inversedBy: 'channels')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['channel:item'])]
    private Workspace $workspace;

    #[ORM\ManyToMany(targetEntity: User::class)]
    #[Groups(['channel:item'])]
    private Collection $members;

    #[ORM\OneToMany(mappedBy: 'channel', targetEntity: Message::class)]
    #[Groups(['channel:item'])]
    private Collection $messages;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['channel:item'])]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->members = new ArrayCollection();
        $this->messages = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getName(): string { return $this->name; }
    public function setName(string $name): self { $this->name = $name; return $this; }

    public function getWorkspace(): Workspace { return $this->workspace; }
    public function setWorkspace(Workspace $workspace): self { $this->workspace = $workspace; return $this; }

    public function getMembers(): Collection { return $this->members; }
    public function getMessages(): Collection { return $this->messages; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
}
