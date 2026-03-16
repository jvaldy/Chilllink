<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Message;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use App\Service\MessageNormalizer;

class MessagePublisher
{
    // Hub Mercure pour publier des updates SSE
    public function __construct(
        private HubInterface $hub
    ) {}

    // Publie un message sur le topic du canal
    public function publish(Message $message): void
    {
        // Prépare un payload simple (non utilisé dans l'update actuel)
        $payload = [
            'type' => 'message',
            'payload' => [
                'id'        => $message->getId(),
                'content'   => $message->getContent(),
                'author'    => $message->getAuthor()->getEmail(),
                'channelId' => $message->getChannel()->getId(),
                'createdAt' => $message->getCreatedAt()->format(DATE_ATOM),
            ],
        ];

        // Crée l'update Mercure avec la version normalisée
        $update = new Update(
            sprintf('channel/%d', $message->getChannel()->getId()),
            json_encode([
                'type' => 'message',
                'payload' => MessageNormalizer::normalize($message),
            ]),
            false
        );

        // Envoie l'update au hub
        $this->hub->publish($update);
    }
}
