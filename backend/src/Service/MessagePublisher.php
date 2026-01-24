<?php

namespace App\Service;

use App\Entity\Message;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use App\Service\MessageNormalizer;

class MessagePublisher
{
    public function __construct(
        private HubInterface $hub
    ) {}

    public function publish(Message $message): void
    {
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

        $update = new Update(
            sprintf('channel/%d', $message->getChannel()->getId()),
            json_encode([
                'type' => 'message',
                'payload' => MessageNormalizer::normalize($message),
            ]),
            false
        );

        $this->hub->publish($update);
    }
}

