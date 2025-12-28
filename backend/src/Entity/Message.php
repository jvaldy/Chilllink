<?php

namespace App\Entity;

use App\Repository\MessageRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: MessageRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Message
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['message:item', 'channel:item'])]
    private ?int $id = null;

    #[ORM\Column(type: 'text')]
    #[Groups(['message:item', 'channel:item'])]
    private string $content;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['message:item', 'channel:item'])]
    private User $author;

    /**
     * Relation propriétaire vers Channel
     * (doit correspondre à Channel::$messages via inversedBy)
     */
    #[ORM\ManyToOne(targetEntity: Channel::class, inversedBy: 'messages')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['message:item'])]
    private Channel $channel;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['message:item', 'channel:item'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    // --------------- GETTERS ----------------

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function setContent(string $content): self
    {
        $this->content = $content;
        return $this;
    }

    public function getAuthor(): User
    {
        return $this->author;
    }

    public function setAuthor(User $author): self
    {
        $this->author = $author;
        return $this;
    }

    public function getChannel(): Channel
    {
        return $this->channel;
    }

    public function setChannel(Channel $channel): self
    {
        $this->channel = $channel;
        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
