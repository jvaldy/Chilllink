<?php

namespace App\Tests\Security\Voter;

use App\Entity\User;
use App\Entity\Workspace;
use App\Security\Voter\WorkspaceVoter;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class WorkspaceVoterTest extends TestCase
{
    public function testViewGrantedForMember(): void
    {
        $owner = (new User())->setEmail('owner@example.com');
        $member = (new User())->setEmail('member@example.com');
        $workspace = (new Workspace())->setName('WS')->setOwner($owner)->addMember($owner)->addMember($member);

        $token = $this->createMock(TokenInterface::class);
        $token->method('getUser')->willReturn($member);

        $result = (new WorkspaceVoter())->vote($token, $workspace, [WorkspaceVoter::VIEW]);
        $this->assertSame(VoterInterface::ACCESS_GRANTED, $result);
    }

    public function testViewDeniedForNonMember(): void
    {
        $owner = (new User())->setEmail('owner@example.com');
        $outsider = (new User())->setEmail('outsider@example.com');
        $workspace = (new Workspace())->setName('WS')->setOwner($owner)->addMember($owner);

        $token = $this->createMock(TokenInterface::class);
        $token->method('getUser')->willReturn($outsider);

        $result = (new WorkspaceVoter())->vote($token, $workspace, [WorkspaceVoter::VIEW]);
        $this->assertSame(VoterInterface::ACCESS_DENIED, $result);
    }

    public function testOwnerGrantedForOwner(): void
    {
        $owner = (new User())->setEmail('owner@example.com');
        $workspace = (new Workspace())->setName('WS')->setOwner($owner)->addMember($owner);

        $token = $this->createMock(TokenInterface::class);
        $token->method('getUser')->willReturn($owner);

        $result = (new WorkspaceVoter())->vote($token, $workspace, [WorkspaceVoter::OWNER]);
        $this->assertSame(VoterInterface::ACCESS_GRANTED, $result);
    }

    public function testOwnerDeniedForSimpleMember(): void
    {
        $owner = (new User())->setEmail('owner@example.com');
        $member = (new User())->setEmail('member@example.com');
        $workspace = (new Workspace())->setName('WS')->setOwner($owner)->addMember($owner)->addMember($member);

        $token = $this->createMock(TokenInterface::class);
        $token->method('getUser')->willReturn($member);

        $result = (new WorkspaceVoter())->vote($token, $workspace, [WorkspaceVoter::OWNER]);
        $this->assertSame(VoterInterface::ACCESS_DENIED, $result);
    }

    public function testVoteDeniedForUnsupportedUserImplementation(): void
    {
        $owner = (new User())->setEmail('owner@example.com');
        $workspace = (new Workspace())->setName('WS')->setOwner($owner)->addMember($owner);
        $foreignUser = $this->createMock(UserInterface::class);

        $token = $this->createMock(TokenInterface::class);
        $token->method('getUser')->willReturn($foreignUser);

        $result = (new WorkspaceVoter())->vote($token, $workspace, [WorkspaceVoter::VIEW]);
        $this->assertSame(VoterInterface::ACCESS_DENIED, $result);
    }
}
