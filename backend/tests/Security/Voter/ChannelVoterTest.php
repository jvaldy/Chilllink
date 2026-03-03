<?php

namespace App\Tests\Security\Voter;

use App\Entity\Channel;
use App\Entity\User;
use App\Entity\Workspace;
use App\Security\Voter\ChannelVoter;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class ChannelVoterTest extends TestCase
{
    public function testVoteGrantsAccessToWorkspaceAndChannelMember(): void
    {
        $user = (new User())->setEmail('member@example.com');
        $owner = (new User())->setEmail('owner@example.com');

        $workspace = (new Workspace())->setName('WS')->setOwner($owner)->addMember($owner)->addMember($user);
        $channel = (new Channel())->setName('general')->setWorkspace($workspace)->addMember($user);

        $token = $this->createMock(TokenInterface::class);
        $token->method('getUser')->willReturn($user);

        $result = (new ChannelVoter())->vote($token, $channel, [ChannelVoter::VIEW]);
        $this->assertSame(VoterInterface::ACCESS_GRANTED, $result);
    }

    public function testVoteDeniesWhenUserNotInWorkspace(): void
    {
        $user = (new User())->setEmail('outsider@example.com');
        $owner = (new User())->setEmail('owner@example.com');

        $workspace = (new Workspace())->setName('WS')->setOwner($owner)->addMember($owner);
        $channel = (new Channel())->setName('general')->setWorkspace($workspace)->addMember($user);

        $token = $this->createMock(TokenInterface::class);
        $token->method('getUser')->willReturn($user);

        $result = (new ChannelVoter())->vote($token, $channel, [ChannelVoter::VIEW]);
        $this->assertSame(VoterInterface::ACCESS_DENIED, $result);
    }

    public function testVoteDeniesWhenWorkspaceMemberIsNotChannelMember(): void
    {
        $user = (new User())->setEmail('member@example.com');
        $owner = (new User())->setEmail('owner@example.com');

        $workspace = (new Workspace())->setName('WS')->setOwner($owner)->addMember($owner)->addMember($user);
        $channel = (new Channel())->setName('general')->setWorkspace($workspace);

        $token = $this->createMock(TokenInterface::class);
        $token->method('getUser')->willReturn($user);

        $result = (new ChannelVoter())->vote($token, $channel, [ChannelVoter::VIEW]);
        $this->assertSame(VoterInterface::ACCESS_DENIED, $result);
    }

    public function testVoteAbstainsForUnsupportedAttribute(): void
    {
        $token = $this->createMock(TokenInterface::class);
        $token->method('getUser')->willReturn(new User());

        $result = (new ChannelVoter())->vote($token, new Channel(), ['UNKNOWN']);
        $this->assertSame(VoterInterface::ACCESS_ABSTAIN, $result);
    }
}

