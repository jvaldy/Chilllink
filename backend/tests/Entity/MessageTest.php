<?php

namespace App\Tests\Entity;

use App\Entity\Channel;
use App\Entity\Message;
use App\Entity\User;
use App\Entity\Workspace;
use PHPUnit\Framework\TestCase;

class MessageTest extends TestCase
{
    public function testPrePersistSetsCreatedAt(): void
    {
        $author = (new User())->setEmail('author@example.com');
        $workspace = (new Workspace())->setName('WS')->setOwner($author)->addMember($author);
        $channel = (new Channel())->setName('general')->setWorkspace($workspace);
        $message = (new Message())->setAuthor($author)->setChannel($channel)->setContent('hello');

        $message->onPrePersist();

        $this->assertInstanceOf(\DateTimeImmutable::class, $message->getCreatedAt());
    }
}

