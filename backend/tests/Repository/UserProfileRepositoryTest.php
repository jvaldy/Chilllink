<?php

namespace App\Tests\Repository;

use App\Repository\UserProfileRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class UserProfileRepositoryTest extends KernelTestCase
{
    public function testRepositoryServiceIsAvailable(): void
    {
        self::bootKernel();
        $repo = self::getContainer()->get(UserProfileRepository::class);

        $this->assertInstanceOf(UserProfileRepository::class, $repo);
    }
}

