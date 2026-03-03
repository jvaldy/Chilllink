<?php

namespace App\Tests\Service;

use App\Entity\Channel;
use App\Entity\Message;
use App\Entity\User;
use App\Entity\Workspace;
use App\Service\MessageNormalizer;
use PHPUnit\Framework\TestCase;

class MessageNormalizerTest extends TestCase
{
    public function testNormalizeReturnsExpectedStructure(): void
    {
        $author = (new User())->setEmail('alice@example.com');
        $workspace = (new Workspace())->setName('Acme')->setOwner($author)->addMember($author);
        $channel = (new Channel())->setName('general')->setWorkspace($workspace);
        $message = (new Message())->setAuthor($author)->setChannel($channel)->setContent('hello');
        $message->onPrePersist();

        $this->setId($author, 10);
        $this->setId($channel, 20);
        $this->setId($message, 30);

        $normalized = MessageNormalizer::normalize($message);

        $this->assertSame(30, $normalized['id']);
        $this->assertSame('hello', $normalized['content']);
        $this->assertSame(10, $normalized['author']['id']);
        $this->assertSame('alice@example.com', $normalized['author']['email']);
        $this->assertSame(20, $normalized['channelId']);
        $this->assertSame($message->getCreatedAt()->format(DATE_ATOM), $normalized['createdAt']);
    }

    private function setId(object $entity, int $id): void
    {
        $reflection = new \ReflectionObject($entity);
        $property = $reflection->getProperty('id');
        $property->setValue($entity, $id);
    }
}

