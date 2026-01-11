<?php

namespace App\Service;

use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;

class TypingPublisher
{
    public function __construct(
        private HubInterface $hub
    ) {}

    public function publish(int $channelId, array $payload): void
    {
        $update = new Update(
            sprintf('typing/channel/%d', $channelId),
            json_encode([
                'type' => 'typing',
                'payload' => $payload,
            ]),
            true 
        );

        $this->hub->publish($update);
    }
}
