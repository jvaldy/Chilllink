<?php

namespace App\Tests\Entity;

use App\Entity\User;
use App\Entity\Workspace;
use PHPUnit\Framework\TestCase;

class WorkspaceTest extends TestCase
{
    public function testAddMemberIsIdempotentAndIsMemberWorks(): void
    {
        $owner = (new User())->setEmail('owner@example.com');
        $member = (new User())->setEmail('member@example.com');

        $workspace = (new Workspace())->setName('WS')->setOwner($owner)->addMember($owner);
        $workspace->addMember($member);
        $workspace->addMember($member);

        $this->assertTrue($workspace->isMember($member));
        $this->assertCount(2, $workspace->getMembers());
    }

    public function testRemoveMemberDoesNotRemoveOwner(): void
    {
        $owner = (new User())->setEmail('owner@example.com');
        $workspace = (new Workspace())->setName('WS')->setOwner($owner)->addMember($owner);

        $workspace->removeMember($owner);

        $this->assertTrue($workspace->isMember($owner));
        $this->assertCount(1, $workspace->getMembers());
    }
}

