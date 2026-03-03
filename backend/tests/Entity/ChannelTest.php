<?php

namespace App\Tests\Entity;

use App\Entity\Channel;
use App\Entity\User;
use App\Entity\Workspace;
use PHPUnit\Framework\TestCase;

class ChannelTest extends TestCase
{
    public function testAddMemberIsIdempotent(): void
    {
        $owner = (new User())->setEmail('owner@example.com');
        $workspace = (new Workspace())->setName('WS')->setOwner($owner)->addMember($owner);
        $channel = (new Channel())->setName('general')->setWorkspace($workspace);
        $member = (new User())->setEmail('member@example.com');

        $channel->addMember($member);
        $channel->addMember($member);

        $this->assertTrue($channel->isMember($member));
        $this->assertCount(1, $channel->getMembers());
    }

    public function testRemoveMemberRemovesExistingUser(): void
    {
        $owner = (new User())->setEmail('owner@example.com');
        $workspace = (new Workspace())->setName('WS')->setOwner($owner)->addMember($owner);
        $channel = (new Channel())->setName('general')->setWorkspace($workspace);
        $member = (new User())->setEmail('member@example.com');
        $channel->addMember($member);

        $channel->removeMember($member);

        $this->assertFalse($channel->isMember($member));
    }
}

