<?php

namespace App\Tests\Service;

use App\Entity\Channel;
use App\Entity\Message;
use App\Entity\User;
use App\Entity\Workspace;
use App\Service\MessagePublisher;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;

class MessagePublisherTest extends TestCase
{
    public function testPublishBuildsExpectedMercureUpdate(): void
    {
        $author = (new User())->setEmail('alice@example.com');
        $workspace = (new Workspace())->setName('Acme')->setOwner($author)->addMember($author);
        $channel = (new Channel())->setName('general')->setWorkspace($workspace);
        $message = (new Message())->setAuthor($author)->setChannel($channel)->setContent('hello');
        $message->onPrePersist();

        $this->setId($author, 7);
        $this->setId($channel, 42);
        $this->setId($message, 99);

        $hub = $this->createMock(HubInterface::class);
        $hub->expects($this->once())
            ->method('publish')
            ->with($this->callback(function (Update $update): bool {
                $this->assertSame(['channel/42'], $update->getTopics());
                $this->assertFalse($update->isPrivate());

                $data = json_decode($update->getData(), true);
                $this->assertSame('message', $data['type'] ?? null);
                $this->assertSame(99, $data['payload']['id'] ?? null);
                $this->assertSame('hello', $data['payload']['content'] ?? null);
                $this->assertSame(7, $data['payload']['author']['id'] ?? null);
                $this->assertSame('alice@example.com', $data['payload']['author']['email'] ?? null);
                $this->assertSame(42, $data['payload']['channelId'] ?? null);
                $this->assertIsString($data['payload']['createdAt'] ?? null);

                return true;
            }))
            ->willReturn('ok');

        (new MessagePublisher($hub))->publish($message);
    }

    private function setId(object $entity, int $id): void
    {
        $reflection = new \ReflectionObject($entity);
        $property = $reflection->getProperty('id');
        $property->setValue($entity, $id);
    }
}

