<?php

namespace App\Tests\Entity;

use App\Entity\User;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    public function testGetRolesAlwaysContainsRoleUserOnlyOnce(): void
    {
        $user = new User();
        $user->setRoles(['ROLE_ADMIN', 'ROLE_USER']);

        $roles = $user->getRoles();

        $this->assertContains('ROLE_ADMIN', $roles);
        $this->assertContains('ROLE_USER', $roles);
        $this->assertSame(1, count(array_keys($roles, 'ROLE_USER', true)));
    }

    public function testSetEmailUpdatesIdentifierAndTimestamp(): void
    {
        $user = new User();
        $before = $user->getUpdatedAt();

        usleep(1000);
        $user->setEmail('john@example.com');

        $this->assertSame('john@example.com', $user->getUserIdentifier());
        $this->assertGreaterThan($before, $user->getUpdatedAt());
    }
}

