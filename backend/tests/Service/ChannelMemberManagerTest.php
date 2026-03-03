<?php

namespace App\Tests\Service;

use App\Entity\Channel;
use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\ChannelMemberManager;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ChannelMemberManagerTest extends TestCase
{
    public function testAddMemberByEmailRequiresEmail(): void
    {
        $repo = $this->createMock(UserRepository::class);
        $em = $this->createMock(EntityManagerInterface::class);
        $repo->expects($this->never())->method('findOneByEmail');
        $em->expects($this->never())->method('flush');

        $manager = new ChannelMemberManager($repo, $em);

        $this->expectException(BadRequestHttpException::class);
        $manager->addMemberByEmail(new Channel(), '   ');
    }

    public function testAddMemberByEmailThrowsWhenUserNotFound(): void
    {
        $repo = $this->createMock(UserRepository::class);
        $em = $this->createMock(EntityManagerInterface::class);

        $repo->expects($this->once())
            ->method('findOneByEmail')
            ->with('missing@example.com')
            ->willReturn(null);
        $em->expects($this->never())->method('flush');

        $manager = new ChannelMemberManager($repo, $em);

        $this->expectException(NotFoundHttpException::class);
        $manager->addMemberByEmail(new Channel(), ' MISSING@example.com ');
    }

    public function testAddMemberByEmailAddsUserAndFlushes(): void
    {
        $repo = $this->createMock(UserRepository::class);
        $em = $this->createMock(EntityManagerInterface::class);

        $channel = new Channel();
        $user = (new User())->setEmail('member@example.com');

        $repo->expects($this->once())
            ->method('findOneByEmail')
            ->with('member@example.com')
            ->willReturn($user);
        $em->expects($this->once())->method('flush');

        $manager = new ChannelMemberManager($repo, $em);
        $result = $manager->addMemberByEmail($channel, 'member@example.com');

        $this->assertSame($user, $result);
        $this->assertTrue($channel->getMembers()->contains($user));
    }

    public function testAddMemberByEmailIsIdempotentForExistingMember(): void
    {
        $repo = $this->createMock(UserRepository::class);
        $em = $this->createMock(EntityManagerInterface::class);

        $channel = new Channel();
        $user = (new User())->setEmail('member@example.com');
        $channel->addMember($user);

        $repo->expects($this->once())
            ->method('findOneByEmail')
            ->with('member@example.com')
            ->willReturn($user);
        $em->expects($this->never())->method('flush');

        $manager = new ChannelMemberManager($repo, $em);
        $result = $manager->addMemberByEmail($channel, 'member@example.com');

        $this->assertSame($user, $result);
        $this->assertCount(1, $channel->getMembers());
    }

    public function testRemoveMemberFlushesWhenPresent(): void
    {
        $repo = $this->createMock(UserRepository::class);
        $em = $this->createMock(EntityManagerInterface::class);

        $channel = new Channel();
        $user = (new User())->setEmail('member@example.com');
        $channel->addMember($user);

        $em->expects($this->once())->method('flush');
        $manager = new ChannelMemberManager($repo, $em);
        $manager->removeMember($channel, $user);

        $this->assertFalse($channel->getMembers()->contains($user));
    }

    public function testRemoveMemberDoesNothingWhenAbsent(): void
    {
        $repo = $this->createMock(UserRepository::class);
        $em = $this->createMock(EntityManagerInterface::class);

        $channel = new Channel();
        $user = (new User())->setEmail('member@example.com');

        $em->expects($this->never())->method('flush');
        $manager = new ChannelMemberManager($repo, $em);
        $manager->removeMember($channel, $user);

        $this->assertFalse($channel->getMembers()->contains($user));
    }
}

