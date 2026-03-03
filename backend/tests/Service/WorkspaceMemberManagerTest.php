<?php

namespace App\Tests\Service;

use App\Entity\User;
use App\Entity\Workspace;
use App\Repository\UserRepository;
use App\Service\WorkspaceMemberManager;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class WorkspaceMemberManagerTest extends TestCase
{
    public function testAddMemberByEmailThrowsWhenUserNotFound(): void
    {
        $repo = $this->createMock(UserRepository::class);
        $em = $this->createMock(EntityManagerInterface::class);

        $owner = (new User())->setEmail('owner@example.com');
        $workspace = (new Workspace())->setName('WS')->setOwner($owner)->addMember($owner);

        $repo->expects($this->once())
            ->method('findOneBy')
            ->with(['email' => 'missing@example.com'])
            ->willReturn(null);
        $em->expects($this->never())->method('flush');

        $manager = new WorkspaceMemberManager($em, $repo);

        $this->expectException(NotFoundHttpException::class);
        $manager->addMemberByEmail($workspace, ' missing@example.com ');
    }

    public function testAddMemberByEmailReturnsAlreadyMemberWithoutFlush(): void
    {
        $repo = $this->createMock(UserRepository::class);
        $em = $this->createMock(EntityManagerInterface::class);

        $owner = (new User())->setEmail('owner@example.com');
        $member = (new User())->setEmail('member@example.com');
        $this->setId($member, 12);

        $workspace = (new Workspace())->setName('WS')->setOwner($owner)->addMember($owner)->addMember($member);

        $repo->expects($this->once())
            ->method('findOneBy')
            ->with(['email' => 'member@example.com'])
            ->willReturn($member);
        $em->expects($this->never())->method('flush');

        $manager = new WorkspaceMemberManager($em, $repo);
        $result = $manager->addMemberByEmail($workspace, 'member@example.com');

        $this->assertSame('already_member', $result['status'] ?? null);
        $this->assertSame(12, $result['userId'] ?? null);
    }

    public function testAddMemberByEmailAddsMemberAndFlushes(): void
    {
        $repo = $this->createMock(UserRepository::class);
        $em = $this->createMock(EntityManagerInterface::class);

        $owner = (new User())->setEmail('owner@example.com');
        $member = (new User())->setEmail('member@example.com');
        $this->setId($member, 34);

        $workspace = (new Workspace())->setName('WS')->setOwner($owner)->addMember($owner);

        $repo->expects($this->once())
            ->method('findOneBy')
            ->with(['email' => 'member@example.com'])
            ->willReturn($member);
        $em->expects($this->once())->method('flush');

        $manager = new WorkspaceMemberManager($em, $repo);
        $result = $manager->addMemberByEmail($workspace, 'member@example.com');

        $this->assertSame('member_added', $result['status'] ?? null);
        $this->assertSame(34, $result['userId'] ?? null);
        $this->assertTrue($workspace->getMembers()->contains($member));
    }

    public function testRemoveMemberThrowsWhenUserNotFound(): void
    {
        $repo = $this->createMock(UserRepository::class);
        $em = $this->createMock(EntityManagerInterface::class);

        $owner = (new User())->setEmail('owner@example.com');
        $workspace = (new Workspace())->setName('WS')->setOwner($owner)->addMember($owner);

        $repo->expects($this->once())->method('find')->with(999)->willReturn(null);
        $em->expects($this->never())->method('flush');

        $manager = new WorkspaceMemberManager($em, $repo);

        $this->expectException(NotFoundHttpException::class);
        $manager->removeMember($workspace, 999);
    }

    public function testRemoveMemberThrowsWhenTryingToRemoveOwner(): void
    {
        $repo = $this->createMock(UserRepository::class);
        $em = $this->createMock(EntityManagerInterface::class);

        $owner = (new User())->setEmail('owner@example.com');
        $this->setId($owner, 1);
        $workspace = (new Workspace())->setName('WS')->setOwner($owner)->addMember($owner);

        $repo->expects($this->once())->method('find')->with(1)->willReturn($owner);
        $em->expects($this->never())->method('flush');

        $manager = new WorkspaceMemberManager($em, $repo);

        $this->expectException(BadRequestHttpException::class);
        $manager->removeMember($workspace, 1);
    }

    public function testRemoveMemberDoesNothingIfUserIsNotMember(): void
    {
        $repo = $this->createMock(UserRepository::class);
        $em = $this->createMock(EntityManagerInterface::class);

        $owner = (new User())->setEmail('owner@example.com');
        $workspace = (new Workspace())->setName('WS')->setOwner($owner)->addMember($owner);
        $other = (new User())->setEmail('other@example.com');
        $this->setId($other, 2);

        $repo->expects($this->once())->method('find')->with(2)->willReturn($other);
        $em->expects($this->never())->method('flush');

        $manager = new WorkspaceMemberManager($em, $repo);
        $manager->removeMember($workspace, 2);

        $this->assertFalse($workspace->getMembers()->contains($other));
    }

    public function testRemoveMemberRemovesAndFlushesForRegularMember(): void
    {
        $repo = $this->createMock(UserRepository::class);
        $em = $this->createMock(EntityManagerInterface::class);

        $owner = (new User())->setEmail('owner@example.com');
        $member = (new User())->setEmail('member@example.com');
        $this->setId($member, 3);

        $workspace = (new Workspace())->setName('WS')->setOwner($owner)->addMember($owner)->addMember($member);

        $repo->expects($this->once())->method('find')->with(3)->willReturn($member);
        $em->expects($this->once())->method('flush');

        $manager = new WorkspaceMemberManager($em, $repo);
        $manager->removeMember($workspace, 3);

        $this->assertFalse($workspace->getMembers()->contains($member));
    }

    private function setId(object $entity, int $id): void
    {
        $reflection = new \ReflectionObject($entity);
        $property = $reflection->getProperty('id');
        $property->setValue($entity, $id);
    }
}

