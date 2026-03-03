<?php

namespace App\Tests\Service;

use App\Service\TypingPublisher;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;

class TypingPublisherTest extends TestCase
{
    public function testPublishBuildsPrivateTypingUpdate(): void
    {
        $payload = [
            'userId' => 12,
            'typing' => true,
        ];

        $hub = $this->createMock(HubInterface::class);
        $hub->expects($this->once())
            ->method('publish')
            ->with($this->callback(function (Update $update) use ($payload): bool {
                $this->assertSame(['typing/channel/55'], $update->getTopics());
                $this->assertTrue($update->isPrivate());

                $data = json_decode($update->getData(), true);
                $this->assertSame('typing', $data['type'] ?? null);
                $this->assertSame($payload, $data['payload'] ?? null);

                return true;
            }))
            ->willReturn('ok');

        (new TypingPublisher($hub))->publish(55, $payload);
    }
}

