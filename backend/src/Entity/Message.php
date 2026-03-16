<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\MessageRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: MessageRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Message
{
    // Identifiant technique
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['message:item', 'channel:item'])]
    private ?int $id = null;

    // Contenu du message
    #[ORM\Column(type: 'text')]
    #[Groups(['message:item', 'channel:item'])]
    private string $content;

    // Auteur du message
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['message:item'])]
    private User $author;

    // Canal associé
    #[ORM\ManyToOne(targetEntity: Channel::class, inversedBy: 'messages')]
    #[ORM\JoinColumn(nullable: false)]
    private Channel $channel;

    // Date d'envoi
    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['message:item'])]
    private \DateTimeImmutable $createdAt;

    // Initialise la date d'envoi
    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    // Identifiant interne
    public function getId(): ?int { return $this->id; }

    // Contenu
    public function getContent(): string { return $this->content; }
    public function setContent(string $content): self { $this->content = $content; return $this; }

    // Auteur
    public function getAuthor(): User { return $this->author; }
    public function setAuthor(User $author): self { $this->author = $author; return $this; }

    // Canal
    public function getChannel(): Channel { return $this->channel; }
    public function setChannel(Channel $channel): self { $this->channel = $channel; return $this; }

    // Date d'envoi
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
}
